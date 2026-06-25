const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('./models/Employee');
const User = require('./models/User');

async function update() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const manager = await Employee.findOne({ firstName: managerName });
  if (!manager) {
    console.log(`${managerName} not found`);
    mongoose.connection.close();
    return;
  }
  console.log(`${managerName} ID:`, manager._id);

  for (const tName of targetNames) {
    const res = await Employee.updateMany({ firstName: tName }, { reportingManagerId: manager._id });
    console.log(`Updated ${tName}:`, res.modifiedCount);
  }


  mongoose.connection.close();
}

 update();
 
// Usage: set MANAGER_NAME and TARGET_NAMES (comma-separated) env vars
// or run: node db-update-reports.js "ManagerName" "Target1,Target2"
const managerName = process.env.MANAGER_NAME || process.argv[2];
const targetsArg = process.env.TARGET_NAMES || process.argv[3];

if (!managerName || !targetsArg) {
  console.log('Missing parameters. Provide MANAGER_NAME and TARGET_NAMES (comma-separated).');
  console.log('Example: MANAGER_NAME=Khushboo TARGET_NAMES="Krishna,Moni" node db-update-reports.js');
  process.exit(1);
}

const targetNames = targetsArg.split(',').map(s => s.trim()).filter(Boolean);
