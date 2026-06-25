const mongoose = require('mongoose');
require('dotenv').config();
const ApprovalRequest = require('./models/ApprovalRequest');
const LeaveBalance = require('./models/LeaveBalance');
const Employee = require('./models/Employee');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
  
  console.log('--- LEAVE REQUESTS ---');
  const reqs = await ApprovalRequest.find({ type: 'Leave' }).populate('requesterId', 'firstName lastName');
  for (const r of reqs) {
    console.log(`Requester: ${r.requesterId?.firstName} ${r.requesterId?.lastName}, Status: ${r.status}, Details:`, JSON.stringify(r.details));
  }

  console.log('--- LEAVE BALANCES ---');
  const balances = await LeaveBalance.find().populate('employeeId', 'firstName lastName').populate('leaveTypeId', 'name');
  for (const b of balances) {
    console.log(`Emp: ${b.employeeId?.firstName} ${b.employeeId?.lastName}, Type: ${b.leaveTypeId?.name}, Balance: ${b.balance}, Used: ${b.used}`);
  }

  mongoose.connection.close();
}
run().catch(console.error);
