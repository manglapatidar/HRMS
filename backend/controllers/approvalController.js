const ApprovalRequest = require('../models/ApprovalRequest');
const Employee = require('../models/Employee');
const LeaveBalance = require('../models/LeaveBalance');
const AttendanceRecord = require('../models/AttendanceRecord');
const Shift = require('../models/Shift');
const { createNotificationForEmployee, notifyHRAdmins } = require('../utils/notificationHelper');

// @desc    Get pending approvals for manager/HR
// @route   GET /api/approvals/pending
// @access  Private (Manager, HR Admin)
const getPendingApprovals = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    
    // Auto-escalation: Mark pending requests > 48h as escalated
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await ApprovalRequest.updateMany({
      tenantId: req.tenantId,
      status: 'Pending',
      createdAt: { $lt: fortyEightHoursAgo },
      escalated: false
    }, { $set: { escalated: true } });

    let query = {
      tenantId: req.tenantId,
      status: { $in: ['Pending', 'Manager Approved — Pending HR'] },
    };

    const now = new Date();
    const orConditions = [];
    const delegatingMap = {}; // Map to store delegator name by ID

    if ((req.user.role === 'Manager' || req.user.role === 'HR Admin') && employee) {
      // Direct approvals for this user
      orConditions.push({ approverId: employee._id });

      // Find who delegated to this manager/HR
      const delegatingEmployees = await Employee.find({
        tenantId: req.tenantId,
        delegationDelegateId: employee._id,
        delegationStartDate: { $lte: now },
        delegationEndDate: { $gte: now }
      }).select('_id firstName lastName userId');

      const delegatingIds = delegatingEmployees.map(emp => emp._id);
      delegatingEmployees.forEach(emp => {
        delegatingMap[emp._id.toString()] = `${emp.firstName} ${emp.lastName}`;
      });

      if (delegatingIds.length > 0) {
        // Add delegated approvals (from Manager or HR who delegated to this user)
        orConditions.push({ approverId: { $in: delegatingIds } });
      }

      // For Managers: escalated requests from direct reports
      if (req.user.role === 'Manager') {
        const directReports = await Employee.find({ 
          tenantId: req.tenantId,
          reportingManagerId: employee._id 
        }).select('_id');
        const directReportIds = directReports.map(emp => emp._id);
        
        if (directReportIds.length > 0) {
          orConditions.push({ approverId: { $in: directReportIds }, escalated: true });
        }
      }

      if (orConditions.length > 0) {
        query.$or = orConditions;
      }
      delete query.status;
    } else if (req.user.role !== 'HR Admin' && req.user.role !== 'Tenant Admin' && req.user.role !== 'Leadership') {
      return res.json([]);
    }

    const requests = await ApprovalRequest.find(query)
      .populate('requesterId', 'firstName lastName employeeId')
      .populate('approverId', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Add delegation info to each request for frontend display
    if ((req.user.role === 'Manager' || req.user.role === 'HR Admin') && employee) {
      const enrichedRequests = requests.map(req => {
        const reqObj = req.toObject();
        const approverId = reqObj.approverId?._id || reqObj.approverId;
        if (delegatingMap[approverId?.toString()]) {
          reqObj.delegatedFrom = delegatingMap[approverId?.toString()];
        }
        return reqObj;
      });
      
      return res.json(enrichedRequests);
    }

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject a request
// @route   PUT /api/approvals/:id
// @access  Private (Manager, HR Admin)
const processApproval = async (req, res, next) => {
  try {
    const { status, comments } = req.body; // 'Approved' or 'Rejected'
    const request = await ApprovalRequest.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    }).populate('requesterId').populate('approverId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // AUTHORIZATION CHECK: Verify user is authorized to approve this request
    const employee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
    const isHR = req.user.role === 'HR Admin' || req.user.role === 'Tenant Admin';
    
    let isAuthorizedApprover = false;
    
    if (isHR) {
      // HR can approve anything
      isAuthorizedApprover = true;
    } else if (request.approverId && request.approverId._id.toString() === employee?._id.toString()) {
      // User is the direct approver
      isAuthorizedApprover = true;
    } else if (employee) {
      // Check if user is a valid delegate of the approver (works for Manager or HR delegating)
      const now = new Date();
      const approvingEmployee = await Employee.findOne({
        _id: request.approverId,
        tenantId: req.tenantId,
        delegationDelegateId: employee._id,
        delegationStartDate: { $lte: now },
        delegationEndDate: { $gte: now }
      });
      if (approvingEmployee) {
        isAuthorizedApprover = true;
      }
    }
    
    if (!isAuthorizedApprover) {
      return res.status(403).json({ message: 'Access denied. You are not authorized to approve this request.' });
    }
    
    let finalStatus = status;

    if (request.type === 'Leave' && status === 'Approved') {
      const { leaveTypeId, startDate, endDate, isHalfDay } = request.details;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (isHalfDay) diffDays = 0.5;

      if (diffDays > 5 && !isHR && request.status !== 'Manager Approved — Pending HR') {
        finalStatus = 'Manager Approved — Pending HR';
        // Notify HR
        await notifyHRAdmins(req.tenantId, 'Leave Requires HR Approval', `${request.requesterId.firstName} has requested leave > 5 days.`, 'PendingHRApproval');
      } else {
        // Final approval (either <= 5 days or HR is approving)
        const balance = await LeaveBalance.findOne({
          tenantId: req.tenantId,
          employeeId: request.requesterId._id,
          leaveTypeId: leaveTypeId,
        });

        if (balance) {
          balance.used += diffDays;
          balance.balance -= diffDays;
          await balance.save();
        }
      }
    }

    request.status = finalStatus;
    if (comments) request.comments = comments;

    await request.save();

    // Notify requester
    if (finalStatus === 'Approved') {
      await createNotificationForEmployee(req.tenantId, request.requesterId._id, 'Request Approved', `Your ${request.type} request has been approved.`, `${request.type}Approved`);
    } else if (finalStatus === 'Rejected') {
      await createNotificationForEmployee(req.tenantId, request.requesterId._id, 'Request Rejected', `Your ${request.type} request has been rejected.`, `${request.type}Rejected`);
    }

    // If it's an attendance regularization and approved, update/create record
    if (request.type === 'AttendanceRegularization' && finalStatus === 'Approved') {
      const { date, punchInTime, punchOutTime, attendanceRecordId } = request.details;
      const reqDate = new Date(date);
      reqDate.setUTCHours(0, 0, 0, 0);

      // Parse hours and minutes
      const [inH, inM] = punchInTime.split(':').map(Number);
      const [outH, outM] = punchOutTime.split(':').map(Number);

      const punchInDate = new Date(reqDate);
      punchInDate.setHours(inH, inM, 0, 0);

      const punchOutDate = new Date(reqDate);
      punchOutDate.setHours(outH, outM, 0, 0);
      if (punchOutDate < punchInDate) {
        punchOutDate.setDate(punchOutDate.getDate() + 1);
      }

      // Fetch employee's shift rules for calculations
      const reqEmployee = await Employee.findOne({ _id: request.requesterId._id, tenantId: req.tenantId }).populate('shiftId');
      let shift = reqEmployee?.shiftId;
      if (!shift) {
        shift = await Shift.findOne({ tenantId: req.tenantId, isDefault: true });
      }
      const shiftConfig = shift || { startTime: '09:00', endTime: '18:00', gracePeriod: 15 };

      // Calculate status
      let calculatedStatus = 'Present';
      const [shiftH, shiftM] = shiftConfig.startTime.split(':').map(Number);
      const grace = shiftConfig.gracePeriod || 15;
      const lateThreshold = shiftH * 60 + shiftM + grace;
      const punchInM = inH * 60 + inM;

      if (punchInM > lateThreshold) {
        calculatedStatus = 'Late';
      }

      // Parse shift duration for half-day check
      const [startH, startM] = shiftConfig.startTime.split(':').map(Number);
      const [endH, endM] = shiftConfig.endTime.split(':').map(Number);
      let shiftDurationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
      if (shiftDurationHours <= 0) shiftDurationHours += 24;

      const hoursWorked = (punchOutDate - punchInDate) / (1000 * 60 * 60);
      if (hoursWorked < (shiftDurationHours / 2)) {
        calculatedStatus = 'Half-day';
      }

      // Find or create Attendance Record
      let attendance = null;
      if (attendanceRecordId) {
        attendance = await AttendanceRecord.findOne({ _id: attendanceRecordId, tenantId: req.tenantId });
      }
      if (!attendance) {
        attendance = await AttendanceRecord.findOne({
          tenantId: req.tenantId,
          employeeId: request.requesterId._id,
          date: reqDate,
        });
      }

      if (attendance) {
        attendance.punchInTime = punchInDate;
        attendance.punchOutTime = punchOutDate;
        attendance.status = calculatedStatus;
        attendance.shiftStartTime = shiftConfig.startTime;
        attendance.shiftEndTime = shiftConfig.endTime;
        await attendance.save();
      } else {
        await AttendanceRecord.create({
          tenantId: req.tenantId,
          employeeId: request.requesterId._id,
          date: reqDate,
          punchInTime: punchInDate,
          punchOutTime: punchOutDate,
          status: calculatedStatus,
          shiftStartTime: shiftConfig.startTime,
          shiftEndTime: shiftConfig.endTime,
        });
      }
    }

    res.json({ message: `Request ${finalStatus.toLowerCase()} successfully`, request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingApprovals,
  processApproval,
};
