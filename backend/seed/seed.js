require('dotenv').config();
const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Location = require('../models/Location');
const LeaveType = require('../models/LeaveType');
const LeaveBalance = require('../models/LeaveBalance');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await Tenant.deleteMany();
    await User.deleteMany();
    await Employee.deleteMany();
    await Department.deleteMany();
    await Designation.deleteMany();
    await Location.deleteMany();
    await LeaveType.deleteMany();
    await LeaveBalance.deleteMany();

    console.log('Data Cleared...');

    // 1. Create Tenant
    const tenant = await Tenant.create({
      companyId: 'democorp01',
      name: 'Demo Corporation Ltd',
    });
    console.log('Tenant created:', tenant.name);

    // 2. Create Locations
    const locNY = await Location.create({
      tenantId: tenant._id,
      name: 'New York Headquarters',
      address: '123 Broadway St',
      city: 'New York',
      state: 'NY',
      country: 'USA'
    });
    const locSF = await Location.create({
      tenantId: tenant._id,
      name: 'San Francisco Office',
      address: '456 Market St',
      city: 'San Francisco',
      state: 'CA',
      country: 'USA'
    });
    const locMumbai = await Location.create({
      tenantId: tenant._id,
      name: 'Mumbai Office',
      address: '789 Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    });
    console.log('Locations seeded...');

    // 3. Create Departments & Designations
    const deptEngineering = await Department.create({ tenantId: tenant._id, name: 'Engineering', description: 'Technical development and engineering teams' });
    const deptHR = await Department.create({ tenantId: tenant._id, name: 'Human Resources', description: 'People management and recruitment' });
    const deptSales = await Department.create({ tenantId: tenant._id, name: 'Sales', description: 'Business development and client relations' });
    const deptMarketing = await Department.create({ tenantId: tenant._id, name: 'Marketing', description: 'Brand management and customer outreach' });
    const deptFinance = await Department.create({ tenantId: tenant._id, name: 'Finance', description: 'Financial planning and corporate accounting' });
    const deptSupport = await Department.create({ tenantId: tenant._id, name: 'Customer Support', description: 'Client assistance and service desk' });
    const deptManagement = await Department.create({ tenantId: tenant._id, name: 'Management', description: 'Executive leadership team' });

    const desigSDE = await Designation.create({ tenantId: tenant._id, name: 'Software Engineer', departmentId: deptEngineering._id });
    const desigEM = await Designation.create({ tenantId: tenant._id, name: 'Engineering Manager', departmentId: deptEngineering._id });
    const desigSalesRep = await Designation.create({ tenantId: tenant._id, name: 'Sales Representative', departmentId: deptSales._id });
    const desigMarketingSpec = await Designation.create({ tenantId: tenant._id, name: 'Marketing Specialist', departmentId: deptMarketing._id });
    const desigHRManager = await Designation.create({ tenantId: tenant._id, name: 'HR Manager', departmentId: deptHR._id });
    const desigFinanceAnalyst = await Designation.create({ tenantId: tenant._id, name: 'Finance Analyst', departmentId: deptFinance._id });
    const desigSupportAgent = await Designation.create({ tenantId: tenant._id, name: 'Support Agent', departmentId: deptSupport._id });
    const desigCEO = await Designation.create({ tenantId: tenant._id, name: 'CEO', departmentId: deptManagement._id });
    console.log('Departments & Designations seeded...');

    // 4. Create Leave Types
    const ltCasual = await LeaveType.create({ tenantId: tenant._id, name: 'Casual Leave' });
    const ltSick = await LeaveType.create({ tenantId: tenant._id, name: 'Sick Leave' });

    // 5. Create Users (4 Roles)
    // a) Leadership
    const leaderUser = await User.create({ tenantId: tenant._id, email: 'ceo@democorp.com', password: 'password123', role: 'Leadership' });
    const leaderEmployee = await Employee.create({
      tenantId: tenant._id, userId: leaderUser._id, employeeId: 'EMP001',
      firstName: 'Alice', lastName: 'Leader', dateOfJoining: new Date('2020-01-01'),
      departmentId: deptManagement._id, designationId: desigCEO._id, locationId: locNY._id
    });

    // b) HR Admin
    const hrUser = await User.create({ tenantId: tenant._id, email: 'hr@democorp.com', password: 'password123', role: 'HR Admin' });
    const hrEmployee = await Employee.create({
      tenantId: tenant._id, userId: hrUser._id, employeeId: 'EMP002',
      firstName: 'Bob', lastName: 'Admin', dateOfJoining: new Date('2021-01-01'),
      departmentId: deptHR._id, designationId: desigHRManager._id, locationId: locNY._id, reportingManagerId: leaderEmployee._id
    });

    // c) Manager
    const managerUser = await User.create({ tenantId: tenant._id, email: 'manager@democorp.com', password: 'password123', role: 'Manager' });
    const managerEmployee = await Employee.create({
      tenantId: tenant._id, userId: managerUser._id, employeeId: 'EMP003',
      firstName: 'Charlie', lastName: 'Manager', dateOfJoining: new Date('2022-01-01'),
      departmentId: deptEngineering._id, designationId: desigEM._id, locationId: locSF._id, reportingManagerId: leaderEmployee._id
    });

    // d) Employee
    const empUser = await User.create({ tenantId: tenant._id, email: 'employee@democorp.com', password: 'password123', role: 'Employee' });
    const empEmployee = await Employee.create({
      tenantId: tenant._id, userId: empUser._id, employeeId: 'EMP004',
      firstName: 'Dave', lastName: 'Coder', dateOfJoining: new Date('2023-01-01'),
      departmentId: deptEngineering._id, designationId: desigSDE._id, locationId: locSF._id, reportingManagerId: managerEmployee._id
    });

    // 6. Leave Balances for Employee
    await LeaveBalance.create({ tenantId: tenant._id, employeeId: empEmployee._id, leaveTypeId: ltCasual._id, balance: 12 });
    await LeaveBalance.create({ tenantId: tenant._id, employeeId: empEmployee._id, leaveTypeId: ltSick._id, balance: 12 });

    console.log('Sample Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

connectDB().then(importData);
