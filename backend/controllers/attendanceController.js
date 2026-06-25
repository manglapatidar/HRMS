const AttendanceRecord = require('../models/AttendanceRecord');
const Employee = require('../models/Employee');
const Shift = require('../models/Shift');
const ApprovalRequest = require('../models/ApprovalRequest');
const Holiday = require('../models/Holiday');
const { notifyManager } = require('../utils/notificationHelper');

// @desc    Punch in or punch out
// @route   POST /api/attendance/punch
// @access  Private
const punchAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId }).populate('shiftId');
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Set time to start of day in UTC for querying
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let record = await AttendanceRecord.findOne({
      tenantId: req.tenantId,
      employeeId: employee._id,
      date: today,
    });

    const now = new Date();

    // Resolve employee's shift or tenant default shift
    let shift = employee.shiftId;
    if (!shift) {
      shift = await Shift.findOne({ tenantId: req.tenantId, isDefault: true });
    }
    const shiftConfig = shift || { startTime: '09:00', endTime: '18:00', gracePeriod: 15 };

    if (!record) {
      // Punch In
      let status = 'Present';
      
      // Parse shift times
      const [shiftH, shiftM] = shiftConfig.startTime.split(':').map(Number);
      const grace = shiftConfig.gracePeriod || 15;
      const lateThreshold = shiftH * 60 + shiftM + grace;

      const punchInM = now.getHours() * 60 + now.getMinutes();

      if (punchInM > lateThreshold) {
        status = 'Late';
      }

      record = await AttendanceRecord.create({
        tenantId: req.tenantId,
        employeeId: employee._id,
        date: today,
        punchInTime: now,
        status: status,
        shiftStartTime: shiftConfig.startTime,
        shiftEndTime: shiftConfig.endTime,
      });
      return res.status(201).json({ message: 'Punched in successfully', punchStatus: 'Punched In', record });
    } else {
      // Punch Out
      if (record.punchOutTime) {
        return res.status(400).json({ message: 'Already punched out for today', punchStatus: 'Punched Out' });
      }
      record.punchOutTime = now;

      // Parse shift duration to determine half-day threshold (default 4 hours)
      const [startH, startM] = shiftConfig.startTime.split(':').map(Number);
      const [endH, endM] = shiftConfig.endTime.split(':').map(Number);
      let shiftDurationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
      if (shiftDurationHours <= 0) shiftDurationHours += 24; // crossing midnight

      // Calculate total hours worked
      const hoursWorked = (now - record.punchInTime) / (1000 * 60 * 60);
      if (hoursWorked < (shiftDurationHours / 2)) {
        record.status = 'Half-day';
      }

      await record.save();
      return res.status(200).json({ message: 'Punched out successfully', punchStatus: 'Punched Out', record });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records for current user
// @route   GET /api/attendance/my-records
// @access  Private
const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const records = await AttendanceRecord.find({
      tenantId: req.tenantId,
      employeeId: employee._id,
    }).sort({ date: -1 }).limit(30);

    res.json(records);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records (Admin only)
// @route   GET /api/attendance/all
// @access  Private
const getAllAttendance = async (req, res, next) => {
  try {
    if (req.user.role === 'Employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { tenantId: req.tenantId };

    if (req.user.role === 'Manager') {
      const currentEmployee = await Employee.findOne({ userId: req.user._id });
      if (!currentEmployee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      
      // Find all employees reporting to this manager
      const teamMembers = await Employee.find({ 
        tenantId: req.tenantId, 
        reportingManagerId: currentEmployee._id 
      }).select('_id');
      
      const teamMemberIds = teamMembers.map(emp => emp._id);
      teamMemberIds.push(currentEmployee._id); // Include the manager's own records
      query.employeeId = { $in: teamMemberIds };
    }

    const records = await AttendanceRecord.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      records,
      page,
      pages: Math.ceil(await AttendanceRecord.countDocuments(query) / limit),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request attendance regularization
// @route   POST /api/attendance/regularize
// @access  Private
const requestRegularization = async (req, res, next) => {
  try {
    const { date, punchInTime, punchOutTime, comments } = req.body;

    if (!date || !punchInTime || !punchOutTime || !comments) {
      return res.status(400).json({ message: 'Please provide date, punch-in, punch-out, and a reason.' });
    }

    const employee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const targetDate = new Date(date);
    targetDate.setUTCHours(0, 0, 0, 0);

    // Prevent regularization for future dates
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (targetDate > today) {
      return res.status(400).json({ message: 'Cannot request regularization for future dates' });
    }

    // Check if an attendance record exists
    const record = await AttendanceRecord.findOne({
      tenantId: req.tenantId,
      employeeId: employee._id,
      date: targetDate
    });

    // Create approval request
    const request = await ApprovalRequest.create({
      tenantId: req.tenantId,
      type: 'AttendanceRegularization',
      requesterId: employee._id,
      approverId: employee.reportingManagerId || null,
      comments,
      details: {
        date: targetDate,
        punchInTime,
        punchOutTime,
        attendanceRecordId: record ? record._id : null
      }
    });

    if (employee.reportingManagerId) {
      await notifyManager(req.tenantId, employee.reportingManagerId, 'New Regularization Request', `${employee.firstName} applied for attendance regularization.`, 'RegularizationApplied');
    }

    res.status(201).json({ message: 'Regularization request submitted successfully', request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly attendance register grid
// @route   GET /api/attendance/register
// @access  Private (HR Admin, Manager, Leadership)
const getMonthlyRegister = async (req, res, next) => {
  try {
    if (req.user.role === 'Employee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1); // 1-12

    // Get date range of month in UTC
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Resolve employees query depending on role
    let employeeQuery = { tenantId: req.tenantId, status: { $ne: 'Exited' } };

    if (req.user.role === 'Manager') {
      const currentEmployee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
      if (!currentEmployee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      
      const teamMembers = await Employee.find({ 
        tenantId: req.tenantId, 
        reportingManagerId: currentEmployee._id 
      }).select('_id');
      
      const teamMemberIds = teamMembers.map(emp => emp._id);
      teamMemberIds.push(currentEmployee._id); // Include manager's own records
      employeeQuery._id = { $in: teamMemberIds };
    }

    const employees = await Employee.find(employeeQuery)
      .populate('departmentId', 'name')
      .populate('designationId', 'name')
      .select('firstName lastName employeeId dateOfJoining departmentId designationId');

    const employeeIds = employees.map(emp => emp._id);

    // Fetch attendance records
    const attendanceRecords = await AttendanceRecord.find({
      tenantId: req.tenantId,
      employeeId: { $in: employeeIds },
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Fetch holidays
    const holidays = await Holiday.find({
      tenantId: req.tenantId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Fetch approved leave requests
    const leaves = await ApprovalRequest.find({
      tenantId: req.tenantId,
      type: 'Leave',
      status: 'Approved',
      requesterId: { $in: employeeIds },
      $or: [
        { 'details.startDate': { $lte: endOfMonth } },
        { 'details.endDate': { $gte: startOfMonth } }
      ]
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const grid = employees.map(emp => {
      const days = [];
      const empJoinDate = new Date(emp.dateOfJoining);
      empJoinDate.setHours(0, 0, 0, 0);

      for (let d = 1; d <= daysInMonth; d++) {
        // Construct target date
        const targetDate = new Date(Date.UTC(year, month - 1, d));
        const localTargetDate = new Date(year, month - 1, d);
        localTargetDate.setHours(0, 0, 0, 0);

        // Check if employee joined yet
        if (localTargetDate < empJoinDate) {
          days.push({ day: d, status: '-', code: '-' });
          continue;
        }

        // Check holiday
        const isHoliday = holidays.find(h => {
          const hDate = new Date(h.date);
          return hDate.getUTCDate() === d;
        });

        // Check weekend
        const dayOfWeek = localTargetDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

        // Check attendance record
        const attRecord = attendanceRecords.find(r => {
          return r.employeeId.toString() === emp._id.toString() && new Date(r.date).getUTCDate() === d;
        });

        // Check leave
        const isOnLeave = leaves.find(l => {
          if (l.requesterId.toString() !== emp._id.toString()) return false;
          const start = new Date(l.details.startDate);
          const end = new Date(l.details.endDate);
          start.setHours(0,0,0,0);
          end.setHours(0,0,0,0);
          return localTargetDate >= start && localTargetDate <= end;
        });

        let statusText = '-';
        let code = '-';

        if (attRecord) {
          statusText = attRecord.status;
          if (attRecord.status === 'Present') code = 'P';
          else if (attRecord.status === 'Late') code = 'L';
          else if (attRecord.status === 'Half-day') code = 'HD';
          else if (attRecord.status === 'Absent') code = 'A';
          else if (attRecord.status === 'On Leave') code = 'LV';
        } else if (isOnLeave) {
          statusText = 'On Leave';
          code = 'LV';
        } else if (isHoliday) {
          statusText = `Holiday: ${isHoliday.name}`;
          code = 'H';
        } else if (isWeekend) {
          statusText = 'Weekend';
          code = 'WE';
        } else if (localTargetDate < today) {
          // Past date without record is Absent
          statusText = 'Absent';
          code = 'A';
        }

        days.push({
          day: d,
          status: statusText,
          code: code,
          punchInTime: attRecord?.punchInTime || null,
          punchOutTime: attRecord?.punchOutTime || null
        });
      }

      return {
        _id: emp._id,
        employeeId: emp.employeeId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.departmentId?.name || '-',
        designation: emp.designationId?.name || '-',
        days
      };
    });

    res.json({
      year,
      month,
      daysInMonth,
      grid
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  punchAttendance,
  getMyAttendance,
  getAllAttendance,
  requestRegularization,
  getMonthlyRegister,
};
