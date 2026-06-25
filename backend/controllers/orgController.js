const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Location = require('../models/Location');
const AuditLog = require('../models/AuditLog');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveBalance = require('../models/LeaveBalance');
const AttendanceRecord = require('../models/AttendanceRecord');
const { createNotificationForEmployee } = require('../utils/notificationHelper');
const crypto = require('crypto');

// @desc    Get all employees
// @route   GET /api/org/employees
// @access  Private (HR Admin, Manager, Leadership)
const getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { tenantId: req.tenantId };
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
      ];
    }
    
    if (req.query.departmentId) query.departmentId = req.query.departmentId;
    if (req.query.designationId) query.designationId = req.query.designationId;
    if (req.query.locationId) query.locationId = req.query.locationId;
    
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = { $ne: 'Exited' };
    }
    
    // Managers can only see their team
    if (req.user.role === 'Manager') {
      const currentEmployee = await Employee.findOne({ userId: req.user._id });
      if (currentEmployee) {
        query.reportingManagerId = currentEmployee._id;
      }
    }

    const employees = await Employee.find(query)
      .populate('departmentId', 'name')
      .populate('designationId', 'name')
      .populate('locationId', 'name')
      .populate('userId', 'role email')
      .populate('reportingManagerId', 'firstName lastName')
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);

    res.json({
      employees,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization structure (Departments, Designations, Locations)
// @route   GET /api/org/structure
// @access  Private
const getOrgStructure = async (req, res, next) => {
  try {
    const departments = await Department.find({ tenantId: req.tenantId });
    const designations = await Designation.find({ tenantId: req.tenantId }).populate('departmentId', 'name');
    const locations = await Location.find({ tenantId: req.tenantId });

    res.json({ departments, designations, locations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all potential managers
// @route   GET /api/org/managers
// @access  Private
const getManagers = async (req, res, next) => {
  try {
    const managers = await Employee.find({ tenantId: req.tenantId, status: { $ne: 'Exited' } })
      .populate({
        path: 'userId',
        match: { role: { $in: ['Manager', 'Leadership', 'HR Admin'] } },
        select: 'role email'
      });
      
    // Filter out those where userId populate failed (not a manager)
    const validManagers = managers.filter(emp => emp.userId != null);
    res.json(validManagers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization chart data
// @route   GET /api/org/chart
// @access  Private
const getOrgChart = async (req, res, next) => {
  try {
    const employees = await Employee.find({ tenantId: req.tenantId, status: { $ne: 'Exited' } })
      .select('firstName lastName employeeId designationId reportingManagerId profilePhoto userId')
      .populate('designationId', 'name')
      .populate('userId', 'role email');
      
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new employee
// @route   POST /api/org/employees
// @access  Private (HR Admin)
const addEmployee = async (req, res, next) => {
  try {
    const { 
      firstName, lastName, email, phone, 
      departmentId, designationId, locationId, dateOfJoining, 
      role, reportingManagerId, employeeId, shiftId
    } = req.body;

    // Validate role
    if (!['Employee', 'Manager', 'Leadership'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for new user' });
    }

    // Check if user already exists in this tenant
    const userExists = await User.findOne({ tenantId: req.tenantId, email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if employeeId exists
    const empIdExists = await Employee.findOne({ tenantId: req.tenantId, employeeId });
    if (empIdExists) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(4).toString('hex'); // e.g. a3f9b2c1

    // Create User auth record
    const user = await User.create({
      tenantId: req.tenantId,
      email,
      password: tempPassword,
      role,
    });

    // Create Master Employee record
    const employee = await Employee.create({
      tenantId: req.tenantId,
      userId: user._id,
      employeeId,
      firstName,
      lastName,
      contactNumber: phone,
      departmentId: departmentId || undefined,
      designationId: designationId || undefined,
      locationId: locationId || undefined,
      reportingManagerId: reportingManagerId || undefined,
      dateOfJoining: dateOfJoining || new Date(),
      shiftId: shiftId || undefined,
    });

    // Auto-allocate Leave Balances
    const policies = await LeavePolicy.find({ tenantId: req.tenantId }).populate('leaveTypeId');
    for (const pol of policies) {
      if (!pol.leaveTypeId || !pol.leaveTypeId.requiresBalance) continue;
      await LeaveBalance.create({
        tenantId: req.tenantId,
        employeeId: employee._id,
        leaveTypeId: pol.leaveTypeId._id,
        balance: pol.annualAllowance,
        total: pol.annualAllowance,
        used: 0
      });
    }

    // Create Audit Log
    await AuditLog.create({
      tenantId: req.tenantId,
      userId: req.user._id,
      action: 'CREATE_EMPLOYEE',
      details: `Created user ${email} with role ${role} and empId ${employeeId}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: 'Employee created successfully',
      employee,
      credentials: {
        email: user.email,
        temporaryPassword: tempPassword,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's employee profile
// @route   GET /api/org/employees/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId })
      .populate('departmentId', 'name')
      .populate('designationId', 'name')
      .populate('locationId', 'name')
      .populate('reportingManagerId', 'firstName lastName email')
      .populate('delegationDelegateId', 'firstName lastName')
      .populate('userId', 'role email');

    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    res.json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile photo
// @route   POST /api/org/employees/me/avatar
// @access  Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const employee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Save the relative path to the image
    const photoUrl = `/uploads/${req.file.filename}`;
    employee.profilePhoto = photoUrl;
    await employee.save();

    res.json({ message: 'Profile photo updated successfully', profilePhoto: photoUrl });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk add employees
// @route   POST /api/org/employees/bulk
// @access  Private (HR Admin)
const bulkAddEmployees = async (req, res, next) => {
  try {
    const { employees } = req.body;
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty employees array' });
    }

    let successCount = 0;
    const errors = [];
    const createdCredentials = [];

    // Pre-fetch leave policies for auto-allocation
    const policies = await LeavePolicy.find({ tenantId: req.tenantId }).populate('leaveTypeId');

    for (const [index, empData] of employees.entries()) {
      try {
        const { firstName, lastName, email, role, employeeId } = empData;
        
        if (!firstName || !lastName || !email || !role || !employeeId) {
          throw new Error('Missing required fields');
        }

        if (!['Employee', 'Manager', 'Leadership'].includes(role)) {
          throw new Error('Invalid role');
        }

        const userExists = await User.findOne({ tenantId: req.tenantId, email });
        if (userExists) throw new Error('Email already exists');

        const empIdExists = await Employee.findOne({ tenantId: req.tenantId, employeeId });
        if (empIdExists) throw new Error('Employee ID already exists');

        const tempPassword = crypto.randomBytes(4).toString('hex');
        
        const user = await User.create({
          tenantId: req.tenantId,
          email,
          password: tempPassword,
          role,
        });

        const employee = await Employee.create({
          tenantId: req.tenantId,
          userId: user._id,
          employeeId,
          firstName,
          lastName,
          dateOfJoining: empData.dateOfJoining || new Date(),
          departmentId: empData.departmentId || undefined,
          designationId: empData.designationId || undefined,
          locationId: empData.locationId || undefined,
          reportingManagerId: empData.reportingManagerId || undefined,
          shiftId: empData.shiftId || undefined,
        });

        // Auto-allocate leaves
        for (const pol of policies) {
          if (!pol.leaveTypeId || !pol.leaveTypeId.requiresBalance) continue;
          await LeaveBalance.create({
            tenantId: req.tenantId,
            employeeId: employee._id,
            leaveTypeId: pol.leaveTypeId._id,
            balance: pol.annualAllowance,
            total: pol.annualAllowance,
            used: 0
          });
        }

        createdCredentials.push({ email, tempPassword });
        successCount++;
      } catch (err) {
        errors.push({ row: index + 2, email: empData.email, error: err.message });
      }
    }

    res.status(201).json({
      message: `Successfully imported ${successCount} employees.`,
      successCount,
      errors,
      credentials: createdCredentials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate employee exit
// @route   PATCH /api/org/employees/:id/exit
// @access  Private (HR Admin)
const initiateExit = async (req, res, next) => {
  try {
    const { exitDate } = req.body;
    const employee = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId });
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (employee.status === 'Exited') {
      return res.status(400).json({ message: 'Employee is already marked as exited' });
    }

    employee.status = 'Exited';
    employee.exitDate = exitDate || new Date();
    await employee.save();

    await AuditLog.create({
      tenantId: req.tenantId,
      userId: req.user._id,
      action: 'EMPLOYEE_EXIT',
      targetEmployee: employee._id,
      details: `Initiated exit for ${employee.firstName} ${employee.lastName} effective ${employee.exitDate.toISOString()}`
    });

    res.json({ message: 'Employee offboarded successfully', employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee details
// @route   PUT /api/org/employees/:id
// @access  Private (HR Admin)
const updateEmployee = async (req, res, next) => {
  try {
    if (req.user.role !== 'HR Admin') {
      return res.status(403).json({ message: 'Access denied. HR Admin only.' });
    }

    const { 
      firstName, lastName, phone, 
      departmentId, designationId, locationId, dateOfJoining, 
      role, reportingManagerId, shiftId, status
    } = req.body;

    const employee = await Employee.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (phone) employee.contactNumber = phone;
    if (departmentId !== undefined) employee.departmentId = departmentId || undefined;
    if (designationId !== undefined) employee.designationId = designationId || undefined;
    if (locationId !== undefined) employee.locationId = locationId || undefined;
    if (reportingManagerId !== undefined) employee.reportingManagerId = reportingManagerId || undefined;
    if (dateOfJoining) employee.dateOfJoining = dateOfJoining;
    if (shiftId !== undefined) employee.shiftId = shiftId || undefined;
    if (status) employee.status = status;

    await employee.save();

    // If role changed, update User role
    if (role) {
      const user = await User.findOne({ _id: employee.userId, tenantId: req.tenantId });
      if (user) {
        user.role = role;
        await user.save();
      }
    }

    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team directory for manager
// @route   GET /api/org/team/directory
// @access  Private (Manager only)
const getTeamDirectory = async (req, res, next) => {
  try {
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ message: 'Access denied. Managers only.' });
    }

    const manager = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
    if (!manager) {
      return res.status(404).json({ message: 'Manager profile not found' });
    }

    const team = await Employee.find({ 
      tenantId: req.tenantId, 
      reportingManagerId: manager._id, 
      status: { $ne: 'Exited' } 
    })
      .populate('departmentId', 'name')
      .populate('designationId', 'name')
      .populate('locationId', 'name')
      .populate('userId', 'email role');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const directory = [];

    for (const member of team) {
      // Get today's attendance status
      const attendance = await AttendanceRecord.findOne({
        tenantId: req.tenantId,
        employeeId: member._id,
        date: today
      });

      // Get leave balances
      const balances = await LeaveBalance.find({
        tenantId: req.tenantId,
        employeeId: member._id
      }).populate('leaveTypeId', 'name requiresBalance');

      directory.push({
        _id: member._id,
        employeeId: member.employeeId,
        firstName: member.firstName,
        lastName: member.lastName,
        profilePhoto: member.profilePhoto,
        contactNumber: member.contactNumber,
        dateOfJoining: member.dateOfJoining,
        department: member.departmentId?.name || '-',
        designation: member.designationId?.name || '-',
        location: member.locationId?.name || '-',
        email: member.userId?.email || 'N/A',
        attendanceStatus: attendance ? attendance.status : 'Absent',
        balances: balances.map(b => ({
          name: b.leaveTypeId?.name || 'Unknown',
          balance: b.balance,
          total: b.total,
          used: b.used,
          requiresBalance: b.leaveTypeId?.requiresBalance
        }))
      });
    }

    res.json(directory);
  } catch (error) {
    next(error);
  }
};



// @desc    Update delegation settings for current manager
// @route   PUT /api/org/employees/me/delegate
// @access  Private (Manager, HR Admin)
const updateDelegation = async (req, res, next) => {
  try {
    if (req.user.role !== 'Manager' && req.user.role !== 'HR Admin' && req.user.role !== 'Leadership') {
      return res.status(403).json({ message: 'Access denied. Delegation is for Managers and HR.' });
    }

    const { delegateId, startDate, endDate } = req.body;
    
    const employee = await Employee.findOne({ userId: req.user._id, tenantId: req.tenantId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    if (delegateId) {
      const delegate = await Employee.findOne({ _id: delegateId, tenantId: req.tenantId });
      if (!delegate) return res.status(400).json({ message: 'Invalid delegate' });
      
      // Send notification to delegate
      await createNotificationForEmployee(
        req.tenantId,
        delegateId,
        'Delegation Assigned',
        `${employee.firstName} ${employee.lastName} has delegated approval authority to you from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
        'DelegationAssigned'
      );
    }

    employee.delegationDelegateId = delegateId || undefined;
    employee.delegationStartDate = startDate || undefined;
    employee.delegationEndDate = endDate || undefined;
    await employee.save();

    res.json({ message: 'Delegation settings updated successfully', employee });
  } catch (error) {
    next(error);
  }
};

// ==================== DEPARTMENTS CRUD ====================

// @desc    Get all departments with employee counts
// @route   GET /api/org/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ tenantId: req.tenantId });
    
    // Calculate employee counts for each department
    const deptsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({ 
          tenantId: req.tenantId, 
          departmentId: dept._id
        });
        return {
          ...dept.toObject(),
          employeeCount
        };
      })
    );

    res.json(deptsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new department
// @route   POST /api/org/departments
// @access  Private (HR Admin only)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Check unique name per tenant
    const existing = await Department.findOne({ tenantId: req.tenantId, name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'A department with this name already exists' });
    }

    const department = await Department.create({
      tenantId: req.tenantId,
      name: name.trim(),
      description: description || ''
    });

    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a department
// @route   PATCH /api/org/departments/:id
// @access  Private (HR Admin only)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const department = await Department.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    if (name) {
      const existing = await Department.findOne({
        tenantId: req.tenantId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: department._id }
      });
      if (existing) {
        return res.status(400).json({ message: 'A department with this name already exists' });
      }
      department.name = name.trim();
    }
    
    if (description !== undefined) {
      department.description = description;
    }

    await department.save();
    res.json(department);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a department
// @route   DELETE /api/org/departments/:id
// @access  Private (HR Admin only)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if any employees are assigned to this department
    const employeeCount = await Employee.countDocuments({ departmentId: department._id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete — ${employeeCount} employees are assigned to this department. Reassign them first.` 
      });
    }

    // Nullify departmentId reference on any designations
    await Designation.updateMany({ departmentId: department._id }, { $unset: { departmentId: "" } });

    await Department.deleteOne({ _id: department._id });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==================== DESIGNATIONS CRUD ====================

// @desc    Get all designations with employee counts
// @route   GET /api/org/designations
// @access  Private
const getDesignations = async (req, res, next) => {
  try {
    const designations = await Designation.find({ tenantId: req.tenantId }).populate('departmentId', 'name');
    
    const desigsWithCounts = await Promise.all(
      designations.map(async (desig) => {
        const employeeCount = await Employee.countDocuments({ 
          tenantId: req.tenantId, 
          designationId: desig._id
        });
        return {
          ...desig.toObject(),
          employeeCount
        };
      })
    );

    res.json(desigsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new designation
// @route   POST /api/org/designations
// @access  Private (HR Admin only)
const createDesignation = async (req, res, next) => {
  try {
    const { name, departmentId } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Designation name is required' });
    }

    // Check unique name per tenant
    const existing = await Designation.findOne({ tenantId: req.tenantId, name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'A designation with this name already exists' });
    }

    if (departmentId) {
      const deptExists = await Department.findOne({ _id: departmentId, tenantId: req.tenantId });
      if (!deptExists) {
        return res.status(400).json({ message: 'Invalid department selected' });
      }
    }

    const designation = await Designation.create({
      tenantId: req.tenantId,
      name: name.trim(),
      departmentId: departmentId || undefined
    });

    res.status(201).json(designation);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a designation
// @route   PATCH /api/org/designations/:id
// @access  Private (HR Admin only)
const updateDesignation = async (req, res, next) => {
  try {
    const { name, departmentId } = req.body;
    const designation = await Designation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    if (name) {
      const existing = await Designation.findOne({
        tenantId: req.tenantId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: designation._id }
      });
      if (existing) {
        return res.status(400).json({ message: 'A designation with this name already exists' });
      }
      designation.name = name.trim();
    }

    if (departmentId !== undefined) {
      if (departmentId) {
        const deptExists = await Department.findOne({ _id: departmentId, tenantId: req.tenantId });
        if (!deptExists) {
          return res.status(400).json({ message: 'Invalid department selected' });
        }
        designation.departmentId = departmentId;
      } else {
        designation.departmentId = undefined;
      }
    }

    await designation.save();
    res.json(designation);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a designation
// @route   DELETE /api/org/designations/:id
// @access  Private (HR Admin only)
const deleteDesignation = async (req, res, next) => {
  try {
    const designation = await Designation.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }

    const employeeCount = await Employee.countDocuments({ designationId: designation._id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete — ${employeeCount} employees are assigned to this designation. Reassign them first.` 
      });
    }

    await Designation.deleteOne({ _id: designation._id });
    res.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==================== LOCATIONS CRUD ====================

// @desc    Get all locations with employee counts
// @route   GET /api/org/locations
// @access  Private
const getLocations = async (req, res, next) => {
  try {
    const locations = await Location.find({ tenantId: req.tenantId });
    
    const locsWithCounts = await Promise.all(
      locations.map(async (loc) => {
        const employeeCount = await Employee.countDocuments({ 
          tenantId: req.tenantId, 
          locationId: loc._id
        });
        return {
          ...loc.toObject(),
          employeeCount
        };
      })
    );

    res.json(locsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new location
// @route   POST /api/org/locations
// @access  Private (HR Admin only)
const createLocation = async (req, res, next) => {
  try {
    const { name, address, city, state, country } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Location name is required' });
    }

    // Check unique name per tenant
    const existing = await Location.findOne({ tenantId: req.tenantId, name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ message: 'A location with this name already exists' });
    }

    const location = await Location.create({
      tenantId: req.tenantId,
      name: name.trim(),
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || ''
    });

    res.status(201).json(location);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a location
// @route   PATCH /api/org/locations/:id
// @access  Private (HR Admin only)
const updateLocation = async (req, res, next) => {
  try {
    const { name, address, city, state, country } = req.body;
    const location = await Location.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    if (name) {
      const existing = await Location.findOne({
        tenantId: req.tenantId,
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: location._id }
      });
      if (existing) {
        return res.status(400).json({ message: 'A location with this name already exists' });
      }
      location.name = name.trim();
    }

    if (address !== undefined) location.address = address;
    if (city !== undefined) location.city = city;
    if (state !== undefined) location.state = state;
    if (country !== undefined) location.country = country;

    await location.save();
    res.json(location);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a location
// @route   DELETE /api/org/locations/:id
// @access  Private (HR Admin only)
const deleteLocation = async (req, res, next) => {
  try {
    const location = await Location.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const employeeCount = await Employee.countDocuments({ locationId: location._id });
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete — ${employeeCount} employees are assigned to this location. Reassign them first.` 
      });
    }

    await Location.deleteOne({ _id: location._id });
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getOrgStructure,
  getManagers,
  getOrgChart,
  addEmployee,
  bulkAddEmployees,
  initiateExit,
  getMyProfile,
  uploadAvatar,
  updateEmployee,
  getTeamDirectory,
  updateDelegation,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
};
