const AttendanceRecord = require('../models/AttendanceRecord');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

// Helper to parse "HH:MM" into total minutes
const parseTime = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours * 60) + (minutes || 0);
};

exports.getOvertimeReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await AttendanceRecord.find({
      tenantId: req.user.tenantId,
      date: { $gte: startDate, $lte: endDate },
      punchInTime: { $exists: true },
      punchOutTime: { $exists: true },
    }).populate('employeeId', 'firstName lastName employeeId departmentId');

    const overtimeData = {};

    records.forEach(record => {
      if (!record.employeeId) return;

      const empId = record.employeeId._id.toString();
      if (!overtimeData[empId]) {
        overtimeData[empId] = {
          employee: {
            _id: empId,
            employeeId: record.employeeId.employeeId,
            firstName: record.employeeId.firstName,
            lastName: record.employeeId.lastName,
          },
          totalOvertimeHours: 0,
        };
      }

      // Calculate standard shift duration in minutes
      const shiftStart = parseTime(record.shiftStartTime || "09:00");
      const shiftEnd = parseTime(record.shiftEndTime || "18:00");
      let standardDurationMinutes = shiftEnd - shiftStart;
      if (standardDurationMinutes < 0) standardDurationMinutes += 24 * 60; // Cross-midnight shift

      // Calculate actual worked duration in minutes
      const workedMs = new Date(record.punchOutTime) - new Date(record.punchInTime);
      const workedMinutes = Math.floor(workedMs / 60000);

      const overtimeMinutes = workedMinutes - standardDurationMinutes;

      // Only accumulate if overtime is positive and maybe more than a threshold (e.g. 30 mins)?
      // For MVP, just any positive overtime
      if (overtimeMinutes > 0) {
        overtimeData[empId].totalOvertimeHours += (overtimeMinutes / 60);
      }
    });

    // Format output
    const result = Object.values(overtimeData).map(data => ({
      ...data,
      totalOvertimeHours: parseFloat(data.totalOvertimeHours.toFixed(2))
    })).filter(data => data.totalOvertimeHours > 0);

    res.json(result);
  } catch (error) {
    console.error('Overtime Report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAttritionReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const tenantId = req.user.tenantId;

    // 1. Exits in range
    const exitedEmployees = await Employee.find({
      tenantId,
      status: 'Exited',
      exitDate: { $gte: start, $lte: end }
    }).select('firstName lastName employeeId departmentId exitDate dateOfJoining');

    const exitsCount = exitedEmployees.length;

    // 2. Start Headcount
    // Joined before or on start date, AND (not exited OR exited on/after start date)
    const startHeadcountCount = await Employee.countDocuments({
      tenantId,
      dateOfJoining: { $lte: start },
      $or: [
        { status: { $ne: 'Exited' } },
        { exitDate: { $gte: start } }
      ]
    });

    // 3. End Headcount
    // Joined before or on end date, AND (not exited OR exited strictly after end date)
    const endHeadcountCount = await Employee.countDocuments({
      tenantId,
      dateOfJoining: { $lte: end },
      $or: [
        { status: { $ne: 'Exited' } },
        { exitDate: { $gt: end } }
      ]
    });

    const averageHeadcount = (startHeadcountCount + endHeadcountCount) / 2;
    const attritionRate = averageHeadcount > 0 ? (exitsCount / averageHeadcount) * 100 : 0;

    res.json({
      exitsCount,
      startHeadcount: startHeadcountCount,
      endHeadcount: endHeadcountCount,
      averageHeadcount,
      attritionRate: parseFloat(attritionRate.toFixed(2)),
      exitedEmployees
    });

  } catch (error) {
    console.error('Attrition Report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
