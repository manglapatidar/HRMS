const mongoose = require('mongoose');
require('dotenv').config();
const Shift = require('./models/Shift');
const Holiday = require('./models/Holiday');
const Employee = require('./models/Employee');
const User = require('./models/User');
const AttendanceRecord = require('./models/AttendanceRecord');
const ApprovalRequest = require('./models/ApprovalRequest');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to Database');

  const tenantId = new mongoose.Types.ObjectId('6a3b81f75870dd3ca60dcb90');

  // 1. Seed Shifts if none exist
  const shiftCount = await Shift.countDocuments({ tenantId });
  let defaultShift;
  if (shiftCount === 0) {
    defaultShift = await Shift.create({
      tenantId,
      name: 'General Shift',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriod: 15,
      isDefault: true
    });
    console.log('Default Shift Seeded:', defaultShift.name);
  } else {
    defaultShift = await Shift.findOne({ tenantId, isDefault: true });
    console.log('Existing Default Shift:', defaultShift.name);
  }

  // Update employees to have the default shift if not assigned
  await Employee.updateMany({ tenantId, shiftId: { $exists: false } }, { shiftId: defaultShift._id });
  console.log('Assigned default shift to all employees');

  // 2. Seed Holidays if none exist
  const holidayCount = await Holiday.countDocuments({ tenantId });
  if (holidayCount === 0) {
    const holidays = [
      { name: 'New Year Day', date: new Date('2026-01-01') },
      { name: 'Republic Day', date: new Date('2026-01-26') },
      { name: 'Good Friday', date: new Date('2026-04-03') },
      { name: 'Independence Day', date: new Date('2026-08-15') },
      { name: 'Gandhi Jayanti', date: new Date('2026-10-02') },
      { name: 'Christmas Day', date: new Date('2026-12-25') },
    ];
    // Set date hours to 00:00:00Z
    for (const h of holidays) {
      h.tenantId = tenantId;
      h.date.setUTCHours(0,0,0,0);
    }
    await Holiday.create(holidays);
    console.log('Default Holidays Seeded');
  }

  // 3. Seed some attendance logs for this month
  const employees = await Employee.find({ tenantId });
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // current month

  // Let's seed attendance records for the last 5 days
  for (const emp of employees) {
    for (let i = 1; i <= 5; i++) {
      const d = new Date(year, month, today.getDate() - i);
      d.setUTCHours(0, 0, 0, 0);

      // Skip weekends
      if (d.getDay() === 0 || d.getDay() === 6) continue;

      const exists = await AttendanceRecord.findOne({ tenantId, employeeId: emp._id, date: d });
      if (!exists) {
        const inTime = new Date(d);
        // Random check-in around 9:00 AM
        const randomMin = Math.floor(Math.random() * 30); // 0 to 29 mins
        inTime.setHours(9, randomMin, 0, 0);

        const outTime = new Date(d);
        outTime.setHours(18, 0, 0, 0);

        await AttendanceRecord.create({
          tenantId,
          employeeId: emp._id,
          date: d,
          punchInTime: inTime,
          punchOutTime: outTime,
          status: randomMin > 15 ? 'Late' : 'Present',
          shiftStartTime: '09:00',
          shiftEndTime: '18:00'
        });
      }
    }
  }
  console.log('Recent Attendance Logs Seeded');

  // 4. Seed a pending leave request and a regularization request for managers to review
  const LeaveType = require('./models/LeaveType');
  const allEmployees = await Employee.find({ tenantId }).populate('userId');
  const regularEmployees = allEmployees.filter(e => e.userId && e.userId.role === 'Employee');
  const managers = allEmployees.filter(e => e.userId && (e.userId.role === 'Manager' || e.userId.role === 'HR Admin'));

  if (regularEmployees.length > 0) {
    const emp = regularEmployees[0];
    // Find manager for this employee
    const managerId = emp.reportingManagerId || (managers.find(m => m.userId && m.userId.role === 'Manager')?._id);

    if (managerId) {
      // Clear old pending approvals for test cleanup
      await ApprovalRequest.deleteMany({ tenantId, status: 'Pending' });

      const leaveType = await LeaveType.findOne({ tenantId });
      const leaveTypeId = leaveType ? leaveType._id : new mongoose.Types.ObjectId();

      // Create a pending leave request
      await ApprovalRequest.create({
        tenantId,
        type: 'Leave',
        status: 'Pending',
        requesterId: emp._id,
        approverId: managerId,
        comments: 'Applying for family function leave next week.',
        details: {
          startDate: new Date(year, month, today.getDate() + 5),
          endDate: new Date(year, month, today.getDate() + 6),
          isHalfDay: false,
          leaveTypeId
        }
      });

      // Create a pending regularization request
      await ApprovalRequest.create({
        tenantId,
        type: 'AttendanceRegularization',
        status: 'Pending',
        requesterId: emp._id,
        approverId: managerId,
        comments: 'Forgot to punch in because of morning team meeting.',
        details: {
          date: new Date(year, month, today.getDate() - 6),
          punchInTime: '09:00',
          punchOutTime: '18:00',
          attendanceRecordId: null
        }
      });
      console.log('Pending Approvals (Leave and Regularization) seeded successfully');
    }
  }

  mongoose.connection.close();
}

seed();
