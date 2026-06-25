const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/hrms-db').then(async () => {
  const LeaveType = require('./models/LeaveType');
  const LeavePolicy = require('./models/LeavePolicy');
  const LeaveBalance = require('./models/LeaveBalance');
  
  // Fix LOP requiresBalance: false
  await LeaveType.updateMany({ name: 'LOP' }, { $set: { requiresBalance: false } });
  
  // Delete LeaveBalance records for LOP
  const lopTypes = await LeaveType.find({ name: 'LOP' });
  for (const lt of lopTypes) {
    await LeaveBalance.deleteMany({ leaveTypeId: lt._id });
    await LeavePolicy.deleteMany({ leaveTypeId: lt._id });
  }

  // Backfill/Fix balances for Sick and Casual
  const policies = await LeavePolicy.find().populate('leaveTypeId');
  for (const pol of policies) {
    if (pol.leaveTypeId && pol.leaveTypeId.requiresBalance) {
      await LeaveBalance.updateMany(
        { leaveTypeId: pol.leaveTypeId._id, used: 0, balance: 0 },
        { $set: { balance: pol.annualAllowance, total: pol.annualAllowance } }
      );
    }
  }
  
  console.log('Database fixed!');
  mongoose.connection.close();
}).catch(console.error);
