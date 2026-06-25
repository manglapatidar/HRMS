const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('./models/Employee');

async function checkAndAssign() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  // Khushboo Patel
  const khushboo = await Employee.findOne({ firstName: 'Khushboo' });
  if (!khushboo) {
    console.log('Khushboo not found');
    mongoose.connection.close();
    return;
  }
  console.log('Khushboo Employee ID:', khushboo._id);

  // Let's find other employees in the same tenant
  const others = await Employee.find({ 
    tenantId: khushboo.tenantId, 
    _id: { $ne: khushboo._id },
    status: 'Active'
  });

  console.log('Other active employees:', others.map(e => ({ id: e._id, name: `${e.firstName} ${e.lastName}`, manager: e.reportingManagerId })));

  // If there are employees not reporting to Khushboo, let's assign one (e.g. Krishu or anyone else) to report to her.
  if (others.length > 0) {
    const target = others[0];
    target.reportingManagerId = khushboo._id;
    await target.save();
    console.log(`Assigned ${target.firstName} ${target.lastName} to report to Khushboo (${khushboo.firstName})`);
  }

  // Let's double check team size count query
  const count = await Employee.countDocuments({
    tenantId: khushboo.tenantId,
    reportingManagerId: khushboo._id,
    status: 'Active'
  });
  console.log('Confirm team size count in DB:', count);

  mongoose.connection.close();
}

checkAndAssign();
