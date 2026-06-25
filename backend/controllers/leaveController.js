const ApprovalRequest = require('../models/ApprovalRequest');
const Employee = require('../models/Employee');
const LeaveBalance = require('../models/LeaveBalance');
const { notifyManager } = require('../utils/notificationHelper');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { leaveTypeId, startDate, endDate, isHalfDay, comments } = req.body;

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    // Overlap validation
    const overlappingRequests = await ApprovalRequest.find({
      requesterId: employee._id,
      type: 'Leave',
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { 'details.startDate': { $lte: endDate }, 'details.endDate': { $gte: startDate } }
      ]
    });

    if (overlappingRequests.length > 0) {
      return res.status(400).json({ message: 'Leave request overlaps with an existing pending or approved leave' });
    }

    const request = await ApprovalRequest.create({
      tenantId: req.tenantId,
      type: 'Leave',
      requesterId: employee._id,
      approverId: employee.reportingManagerId, // Route to manager
      comments,
      details: {
        leaveTypeId,
        startDate,
        endDate,
        isHalfDay,
      },
    });

    if (employee.reportingManagerId) {
      await notifyManager(req.tenantId, employee.reportingManagerId, 'New Leave Request', `${employee.firstName} applied for leave.`, 'LeaveApplied');
    }

    res.status(201).json({ message: 'Leave request submitted successfully', request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave balance
// @route   GET /api/leaves/balance
// @access  Private
const getLeaveBalance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const balances = await LeaveBalance.find({
      tenantId: req.tenantId,
      employeeId: employee._id,
    }).populate('leaveTypeId', 'name isPaid');

    res.json(balances);
  } catch (error) {
    next(error);
  }
};

// @desc    Get my leave requests
// @route   GET /api/leaves/my-requests
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const requests = await ApprovalRequest.find({
      requesterId: employee._id,
      type: 'Leave',
    }).sort({ createdAt: -1 });

    // Populate leave type names manually or keep it simple.
    // The details object holds leaveTypeId.
    
    // We should populate the approver info if possible
    await ApprovalRequest.populate(requests, { path: 'approverId', select: 'firstName lastName' });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/withdraw a leave request
// @route   PATCH /api/leaves/:id/cancel
// @access  Private
const cancelLeave = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const request = await ApprovalRequest.findOne({
      _id: req.params.id,
      requesterId: employee._id,
      type: 'Leave'
    });

    if (!request) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (request.status === 'Rejected') {
      return res.status(400).json({ message: 'Cannot cancel a rejected request' });
    }

    if (request.status === 'Cancelled') {
      return res.status(400).json({ message: 'Request is already cancelled' });
    }

    // If it was Approved, we need to restore the balance
    if (request.status === 'Approved') {
      const { leaveTypeId, startDate, endDate, isHalfDay } = request.details;
      // Calculate days
      const start = new Date(startDate);
      const end = new Date(endDate);
      let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (isHalfDay) days = 0.5;

      const balance = await LeaveBalance.findOne({
        employeeId: employee._id,
        leaveTypeId: leaveTypeId
      });

      if (balance) {
        balance.balance += days;
        balance.used -= days;
        await balance.save();
      }
    }

    request.status = 'Cancelled';
    request.actionHistory = request.actionHistory || [];
    request.actionHistory.push({
      action: 'CANCEL',
      actorId: employee._id,
      comments: 'Cancelled by employee',
      date: new Date()
    });
    
    await request.save();

    res.json({ message: 'Leave request cancelled successfully', request });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves/admin/all
// @access  Private (HR Admin)
const getAllLeavesAdmin = async (req, res, next) => {
  try {
    const requests = await ApprovalRequest.find({
      tenantId: req.tenantId,
      type: 'Leave',
    })
      .populate('requesterId', 'firstName lastName employeeId')
      .populate('approverId', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyLeave,
  getLeaveBalance,
  getMyLeaves,
  cancelLeave,
  getAllLeavesAdmin
};
