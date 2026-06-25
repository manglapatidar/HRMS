const User = require('../models/User');
const Tenant = require('../models/Tenant');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { companyId, email, password, role } = req.body;

    const tenant = await Tenant.findOne({ companyId });
    if (!tenant) {
      return res.status(401).json({ message: 'Invalid company ID' });
    }

    const user = await User.findOne({ tenantId: tenant._id, email, role }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or role' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Create Audit Log
    await AuditLog.create({
      tenantId: tenant._id,
      userId: user._id,
      action: 'LOGIN',
      ipAddress: req.ip,
    });

    const employee = await Employee.findOne({ userId: user._id });

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      employeeId: employee ? employee._id : null,
      firstName: employee ? employee.firstName : null,
      lastName: employee ? employee.lastName : null,
      profilePhoto: employee ? employee.profilePhoto : null,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new company (tenant) and its HR admin
// @route   POST /api/auth/company-signup
// @access  Public
const registerCompany = async (req, res, next) => {
  try {
    const { companyId, companyName, adminEmail, adminPassword, adminFirstName, adminLastName } = req.body;

    const tenantExists = await Tenant.findOne({ companyId });
    if (tenantExists) {
      return res.status(400).json({ message: 'Company ID already exists' });
    }

    const tenant = await Tenant.create({
      companyId,
      name: companyName,
    });

    const user = await User.create({
      tenantId: tenant._id,
      email: adminEmail,
      password: adminPassword,
      role: 'HR Admin',
    });

    const employee = await Employee.create({
      tenantId: tenant._id,
      userId: user._id,
      employeeId: 'EMP001',
      firstName: adminFirstName,
      lastName: adminLastName,
      dateOfJoining: new Date(),
    });

    res.status(201).json({
      message: 'Company registered successfully',
      tenantId: tenant.companyId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save(); // User model should hash it automatically if pre-save is setup

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  registerCompany,
  changePassword,
};
