const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Employee = require('./models/Employee');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const managers = await User.find({ role: 'Manager' });
  console.log('Manager Users:', managers.map(u => ({ id: u._id, email: u.email })));

  for (const m of managers) {
    const emp = await Employee.findOne({ userId: m._id });
    console.log(`Employee record for ${m.email}:`, emp ? {
      id: emp._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      reportingManagerId: emp.reportingManagerId,
      tenantId: emp.tenantId
    } : 'None');
  }

  mongoose.connection.close();
}
test();
