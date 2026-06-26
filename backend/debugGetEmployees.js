const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const User = require('./models/User');
const { getEmployees } = require('./controllers/orgController');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4, serverSelectionTimeoutMS: 5000, connectTimeoutMS: 10000 });
  const leadership = await User.findOne({ role: 'Leadership' }).lean();
  console.log('Leadership user:', leadership ? { id: leadership._id.toString(), email: leadership.email, tenantId: leadership.tenantId?.toString() } : null);
  const hr = await User.findOne({ role: 'HR Admin' }).lean();
  console.log('HR Admin user:', hr ? { id: hr._id.toString(), email: hr.email, tenantId: hr.tenantId?.toString() } : null);

  if (!leadership) {
    console.error('No Leadership user found');
    process.exit(1);
  }

  const req = {
    query: { status: 'Active,On Probation' },
    user: leadership,
    tenantId: leadership.tenantId,
  };

  const res = {
    json: (data) => {
      console.log('RESULT LENGTH', data.employees?.length);
      console.log('PAGE', data.page, 'TOTAL', data.total);
      console.log('IDS', data.employees?.slice(0, 10).map(e => ({ id: e._id.toString(), employeeId: e.employeeId, status: e.status, tenantId: e.tenantId?.toString(), userRole: e.userId?.role })));
      process.exit(0);
    }
  };

  await getEmployees(req, res, (err) => {
    console.error('ERR', err);
    process.exit(1);
  });
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});