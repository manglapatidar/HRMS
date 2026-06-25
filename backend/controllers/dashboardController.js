const Employee = require('../models/Employee');
const AttendanceRecord = require('../models/AttendanceRecord');
const ApprovalRequest = require('../models/ApprovalRequest');
const mongoose = require('mongoose');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const employee = await Employee.findOne({ userId: req.user._id });
    
    let stats = {};

    if (role === 'HR Admin' || role === 'Leadership') {
      const totalEmployees = await Employee.countDocuments({ tenantId: req.tenantId, status: 'Active' });
      const pendingApprovals = await ApprovalRequest.countDocuments({ tenantId: req.tenantId, status: 'Pending' });
      
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const presentToday = await AttendanceRecord.countDocuments({
        tenantId: req.tenantId,
        date: today,
        status: 'Present'
      });

      // Calculate attendance trends for the last 5 days
      const attendanceTrends = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 4; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        
        const presentCount = await AttendanceRecord.countDocuments({
          tenantId: req.tenantId,
          date: d,
          status: { $in: ['Present', 'Late', 'Half-day'] }
        });
        
        const absentCount = totalEmployees - presentCount;
        
        attendanceTrends.push({
          name: dayNames[d.getDay()],
          present: Math.round((presentCount / (totalEmployees || 1)) * 100),
          absent: Math.round((absentCount / (totalEmployees || 1)) * 100)
        });
      }

      stats = { totalEmployees, pendingApprovals, presentToday, attendanceTrends };
    } else if (role === 'Manager') {
      if (employee) {
        // Team statistics
        const directReports = await Employee.find({ tenantId: req.tenantId, reportingManagerId: employee._id, status: 'Active' });
        const teamSize = directReports.length;
        const directReportIds = directReports.map(emp => emp._id);

        const pendingApprovals = await ApprovalRequest.countDocuments({ tenantId: req.tenantId, approverId: employee._id, status: 'Pending' });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const presentToday = await AttendanceRecord.countDocuments({
          tenantId: req.tenantId,
          employeeId: { $in: directReportIds },
          date: { $gte: today, $lt: tomorrow },
          status: { $in: ['Present', 'Late', 'Half-day'] }
        });

        const onLeaveToday = await ApprovalRequest.countDocuments({
          tenantId: req.tenantId,
          type: 'Leave',
          status: 'Approved',
          requesterId: { $in: directReportIds },
          'details.startDate': { $lte: today },
          'details.endDate': { $gte: today }
        });

        // Employee self-service stats for the manager
        const pendingLeaves = await ApprovalRequest.countDocuments({ 
          tenantId: req.tenantId, 
          requesterId: employee._id, 
          type: 'Leave', 
          status: 'Pending' 
        });

        const presentTodayRecord = await AttendanceRecord.findOne({
          tenantId: req.tenantId,
          employeeId: employee._id,
          date: today,
        });

        let punchStatus = 'Not Punched In';
        let isPresentToday = false;

        if (presentTodayRecord) {
          isPresentToday = ['Present', 'Late', 'Half-day'].includes(presentTodayRecord.status);
          if (presentTodayRecord.punchOutTime) {
            punchStatus = 'Punched Out';
          } else if (presentTodayRecord.punchInTime) {
            punchStatus = 'Punched In';
          }
        }

        const attendanceTrends = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 4; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);

          const record = await AttendanceRecord.findOne({
            tenantId: req.tenantId,
            employeeId: employee._id,
            date: d,
          });

          const status = record ? record.status : 'Absent';

          attendanceTrends.push({
            name: dayNames[d.getDay()],
            present: ['Present', 'Late', 'Half-day'].includes(status) ? 100 : 0,
            absent: ['Present', 'Late', 'Half-day'].includes(status) ? 0 : 100
          });
        }

        stats = {
          message: 'Welcome to your dashboard',
          teamSize,
          pendingApprovals,
          presentToday,
          onLeaveToday,
          pendingLeaves,
          isPresentToday,
          punchStatus,
          attendanceTrends
        };
      }
    } else {
      // Employee Stats
      if (employee) {
        const pendingLeaves = await ApprovalRequest.countDocuments({ 
          tenantId: req.tenantId, 
          requesterId: employee._id, 
          type: 'Leave', 
          status: 'Pending' 
        });

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const presentTodayRecord = await AttendanceRecord.findOne({
          tenantId: req.tenantId,
          employeeId: employee._id,
          date: today,
        });
        
        let punchStatus = 'Not Punched In';
        let isPresentToday = false;
        
        if (presentTodayRecord) {
          isPresentToday = ['Present', 'Late', 'Half-day'].includes(presentTodayRecord.status);
          if (presentTodayRecord.punchOutTime) {
            punchStatus = 'Punched Out';
          } else if (presentTodayRecord.punchInTime) {
            punchStatus = 'Punched In';
          }
        }

        // Fetch attendance for this week for the employee
        const attendanceTrends = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 4; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          
          const record = await AttendanceRecord.findOne({
            tenantId: req.tenantId,
            employeeId: employee._id,
            date: d,
          });
          
          const status = record ? record.status : 'Absent';
          
          attendanceTrends.push({
            name: dayNames[d.getDay()],
            present: ['Present', 'Late', 'Half-day'].includes(status) ? 100 : 0,
            absent: ['Present', 'Late', 'Half-day'].includes(status) ? 0 : 100
          });
        }

        stats = {
          message: 'Welcome to your dashboard',
          pendingLeaves,
          isPresentToday,
          punchStatus,
          attendanceTrends
        };
      } else {
        stats = { message: 'Welcome to your dashboard' };
      }
    }

    // Ensure personal punch status is included for the requesting user
    const finalStats = await attachPersonalPunchStatus(req, stats);
    res.json(finalStats);
  } catch (error) {
    next(error);
  }
};

// Helper: attach personal punchStatus for the requesting user if they have an employee record
const attachPersonalPunchStatus = async (req, stats) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
    if (!employee) return stats;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const presentTodayRecord = await AttendanceRecord.findOne({ tenantId: req.tenantId, employeeId: employee._id, date: today });

    let punchStatus = 'Not Punched In';
    let isPresentToday = false;

    if (presentTodayRecord) {
      isPresentToday = ['Present', 'Late', 'Half-day'].includes(presentTodayRecord.status);
      if (presentTodayRecord.punchOutTime) punchStatus = 'Punched Out';
      else if (presentTodayRecord.punchInTime) punchStatus = 'Punched In';
    }

    return { ...stats, punchStatus, isPresentToday };
  } catch (err) {
    return stats;
  }
};

// @desc    Get workforce analytics
// @route   GET /api/dashboard/workforce-analytics
// @access  Private (Leadership, HR Admin)
const getWorkforceAnalytics = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    
    // 1. Total Headcount (Active)
    const totalHeadcount = await Employee.countDocuments({ tenantId, status: 'Active' });
    
    // 2. Pending Approvals
    const pendingApprovals = await ApprovalRequest.countDocuments({ tenantId, status: 'Pending' });

    // 3. Attendance % Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendanceTodayCount = await AttendanceRecord.countDocuments({
      tenantId,
      date: { $gte: today, $lt: tomorrow }
    });

    const attendanceTodayPercent = totalHeadcount > 0 
      ? Math.round((attendanceTodayCount / totalHeadcount) * 100) 
      : 0;

    // 4. Headcount by Department
    const deptHeadcount = await Employee.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), status: 'Active' } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$dept.name', 'Unassigned'] }, value: '$count' } }
    ]);

    // 5. Attendance Trend (Last 30 Days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendanceRecords = await AttendanceRecord.aggregate([
      { $match: { 
          tenantId: new mongoose.Types.ObjectId(tenantId), 
          date: { $gte: thirtyDaysAgo } 
      }},
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          presentCount: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const attendanceTrend = attendanceRecords.map(record => ({
      date: record._id,
      percent: totalHeadcount > 0 ? Math.round((record.presentCount / totalHeadcount) * 100) : 0
    }));

    // 6. Leave Usage Trend (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const allApprovedLeaves = await ApprovalRequest.find({
      tenantId,
      type: 'Leave',
      status: 'Approved',
      'details.startDate': { $gte: sixMonthsAgo }
    });

    const monthlyLeaves = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      monthlyLeaves[monthStr] = 0;
    }

    allApprovedLeaves.forEach(req => {
      const d = new Date(req.details.startDate);
      const monthStr = d.toLocaleString('default', { month: 'short' });
      if (monthlyLeaves[monthStr] !== undefined) {
        let diffDays = Math.ceil(Math.abs(new Date(req.details.endDate) - new Date(req.details.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        if (req.details.isHalfDay) diffDays = 0.5;
        monthlyLeaves[monthStr] += diffDays;
      }
    });

    const leaveUsageTrend = Object.keys(monthlyLeaves).map(month => ({
      month,
      days: monthlyLeaves[month]
    }));

    // 7. Attrition Stat
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const exitedRecent = await Employee.countDocuments({
      tenantId,
      status: 'Exited',
      exitDate: { $gte: ninetyDaysAgo }
    });

    const headcount90DaysAgo = totalHeadcount + exitedRecent; // approximation
    const averageHeadcount = (totalHeadcount + headcount90DaysAgo) / 2;
    const attritionRate = averageHeadcount > 0 ? ((exitedRecent / averageHeadcount) * 100).toFixed(1) : 0;

    res.json({
      totalHeadcount,
      activeEmployees: totalHeadcount,
      attendanceTodayPercent,
      pendingApprovals,
      deptHeadcount,
      attendanceTrend,
      leaveUsageTrend,
      attritionRate
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get team reports for managers (scoped to direct reports)
// @route   GET /api/dashboard/team-reports
// @access  Private (Manager only)
const getTeamReports = async (req, res, next) => {
  try {
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const manager = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
    if (!manager) {
      return res.status(404).json({ message: 'Manager profile not found' });
    }

    // 1. Get all active direct reports
    const directReports = await Employee.find({
      tenantId: req.tenantId,
      reportingManagerId: manager._id,
      status: { $ne: 'Exited' }
    });

    const teamSize = directReports.length;
    const directReportIds = directReports.map(emp => emp._id);

    // 2. Pending approvals count
    const pendingApprovalsCount = await ApprovalRequest.countDocuments({
      tenantId: req.tenantId,
      approverId: manager._id,
      status: 'Pending'
    });

    // 3. Present Today count
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const presentToday = await AttendanceRecord.countDocuments({
      tenantId: req.tenantId,
      employeeId: { $in: directReportIds },
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ['Present', 'Late', 'Half-day'] }
    });

    // 4. On Leave Today count
    const onLeaveToday = await ApprovalRequest.countDocuments({
      tenantId: req.tenantId,
      type: 'Leave',
      status: 'Approved',
      requesterId: { $in: directReportIds },
      'details.startDate': { $lte: today },
      'details.endDate': { $gte: today }
    });

    // 5. Team Attendance Trend (Last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceRecords = await AttendanceRecord.aggregate([
      { $match: {
          tenantId: new mongoose.Types.ObjectId(req.tenantId),
          employeeId: { $in: directReportIds },
          date: { $gte: thirtyDaysAgo }
      }},
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          presentCount: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    const attendanceTrend = attendanceRecords.map(record => ({
      date: record._id,
      percent: teamSize > 0 ? Math.round((record.presentCount / teamSize) * 100) : 0
    }));

    // 6. Team Leave Usage by Type (Last 90 days)
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const teamLeaves = await ApprovalRequest.aggregate([
      { $match: {
          tenantId: new mongoose.Types.ObjectId(req.tenantId),
          type: 'Leave',
          status: 'Approved',
          requesterId: { $in: directReportIds },
          'details.startDate': { $gte: ninetyDaysAgo }
      }},
      { $group: {
          _id: '$details.leaveTypeId',
          totalDays: { $sum: { $cond: [ '$details.isHalfDay', 0.5, 1 ] } } // simple fallback sum
      }}
    ]);

    // Populate Leave Type names
    const populatedLeaves = [];
    const LeaveType = require('../models/LeaveType');
    for (const item of teamLeaves) {
      if (item._id) {
        const leaveType = await LeaveType.findById(item._id);
        populatedLeaves.push({
          name: leaveType ? leaveType.name : 'Unknown',
          days: item.totalDays
        });
      }
    }

    // 7. Individual team member summary table (current month stats)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const teamSummary = [];

    for (const emp of directReports) {
      // Month attendance records count
      const empAttendanceCount = await AttendanceRecord.countDocuments({
        tenantId: req.tenantId,
        employeeId: emp._id,
        date: { $gte: startOfMonth, $lt: tomorrow },
        status: { $in: ['Present', 'Late', 'Half-day'] }
      });

      // Month leaves taken count
      const empApprovedLeaves = await ApprovalRequest.find({
        tenantId: req.tenantId,
        type: 'Leave',
        status: 'Approved',
        requesterId: emp._id,
        'details.startDate': { $gte: startOfMonth }
      });

      let leavesCount = 0;
      empApprovedLeaves.forEach(req => {
        let diff = Math.ceil(Math.abs(new Date(req.details.endDate) - new Date(req.details.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        if (req.details.isHalfDay) diff = 0.5;
        leavesCount += diff;
      });

      // Simple attendance rate calculation based on days passed this month (max 20 working days etc, we will just use date number)
      const currentDayNumber = today.getDate();
      const attendancePercent = currentDayNumber > 0 ? Math.round((empAttendanceCount / currentDayNumber) * 100) : 0;

      teamSummary.push({
        _id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        employeeId: emp.employeeId,
        attendancePercent,
        leavesCount
      });
    }

    res.json({
      teamSize,
      pendingApprovals: pendingApprovalsCount,
      presentToday,
      onLeaveToday,
      attendanceTrend,
      leaveUsage: populatedLeaves,
      teamSummary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getWorkforceAnalytics,
  getTeamReports,
};
