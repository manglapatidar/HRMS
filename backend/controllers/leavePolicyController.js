const LeaveType = require('../models/LeaveType');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');

// @desc    Get all leave policies (and types)
// @route   GET /api/leaves/policies
// @access  Private (HR Admin, Leadership)
const getLeavePolicies = async (req, res, next) => {
  try {
    let types = await LeaveType.find({ tenantId: req.tenantId });
    
    // Seed defaults if empty
    if (types.length === 0) {
      const defaultTypes = [
        { name: 'Casual', isPaid: true, requiresBalance: true, colorTag: '#3B82F6', annual: 12 },
        { name: 'Sick', isPaid: true, requiresBalance: true, colorTag: '#EF4444', annual: 10 },
        { name: 'Earned', isPaid: true, requiresBalance: true, colorTag: '#10B981', annual: 15 },
        { name: 'LOP', isPaid: false, requiresBalance: false, colorTag: '#6B7280', annual: 0 },
      ];
      
      for (const dt of defaultTypes) {
        const lt = await LeaveType.create({
          tenantId: req.tenantId,
          name: dt.name,
          isPaid: dt.isPaid,
          requiresBalance: dt.requiresBalance,
          colorTag: dt.colorTag
        });
        if (dt.requiresBalance) {
          await LeavePolicy.create({
            tenantId: req.tenantId,
            leaveTypeId: lt._id,
            annualAllowance: dt.annual,
            carryForwardLimit: 0
          });
        }
      }
      types = await LeaveType.find({ tenantId: req.tenantId });
    }

    const policies = await LeavePolicy.find({ tenantId: req.tenantId });
    
    const result = types.map(type => {
      const policy = policies.find(p => p.leaveTypeId.toString() === type._id.toString());
      return {
        _id: type._id,
        name: type.name,
        isPaid: type.isPaid,
        requiresBalance: type.requiresBalance,
        colorTag: type.colorTag,
        annualAllowance: policy ? policy.annualAllowance : 0,
        carryForwardLimit: policy ? policy.carryForwardLimit : 0,
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a leave policy
// @route   POST /api/leaves/policies
// @access  Private (HR Admin)
const createUpdateLeavePolicy = async (req, res, next) => {
  try {
    const { _id, name, isPaid, requiresBalance, colorTag, annualAllowance, carryForwardLimit } = req.body;
    
    let type;
    if (_id) {
      type = await LeaveType.findOneAndUpdate(
        { _id, tenantId: req.tenantId },
        { name, isPaid, requiresBalance, colorTag },
        { new: true }
      );
    } else {
      type = await LeaveType.create({
        tenantId: req.tenantId,
        name, isPaid, requiresBalance, colorTag
      });
    }

    if (requiresBalance) {
      await LeavePolicy.findOneAndUpdate(
        { leaveTypeId: type._id, tenantId: req.tenantId },
        { annualAllowance: annualAllowance || 0, carryForwardLimit: carryForwardLimit || 0 },
        { new: true, upsert: true }
      );
    } else {
      // Remove policy if it no longer requires balance
      await LeavePolicy.deleteOne({ leaveTypeId: type._id, tenantId: req.tenantId });
    }

    res.json({ message: 'Policy saved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Backfill leave balances for all active employees
// @route   POST /api/leaves/policies/backfill
// @access  Private (HR Admin)
const backfillBalances = async (req, res, next) => {
  try {
    const employees = await Employee.find({ tenantId: req.tenantId, status: 'Active' });
    const policies = await LeavePolicy.find({ tenantId: req.tenantId }).populate('leaveTypeId');
    
    let addedCount = 0;

    for (const emp of employees) {
      for (const pol of policies) {
        if (!pol.leaveTypeId || !pol.leaveTypeId.requiresBalance) continue;
        
        const existing = await LeaveBalance.findOne({
          tenantId: req.tenantId,
          employeeId: emp._id,
          leaveTypeId: pol.leaveTypeId._id
        });

        if (!existing) {
          await LeaveBalance.create({
            tenantId: req.tenantId,
            employeeId: emp._id,
            leaveTypeId: pol.leaveTypeId._id,
            balance: pol.annualAllowance,
            total: pol.annualAllowance,
            used: 0
          });
          addedCount++;
        }
      }
    }

    res.json({ message: `Successfully added ${addedCount} missing leave balances.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually adjust an employee's leave balance
// @route   POST /api/leaves/admin/adjust-balance
// @access  Private (HR Admin)
const adjustBalance = async (req, res, next) => {
  try {
    const { employeeId, leaveTypeId, adjustment, reason } = req.body;
    
    let balance = await LeaveBalance.findOne({
      tenantId: req.tenantId,
      employeeId,
      leaveTypeId
    });

    if (!balance) {
      // Create if it doesn't exist
      const policy = await LeavePolicy.findOne({ tenantId: req.tenantId, leaveTypeId });
      balance = await LeaveBalance.create({
        tenantId: req.tenantId,
        employeeId,
        leaveTypeId,
        balance: (policy ? policy.annualAllowance : 0),
        total: (policy ? policy.annualAllowance : 0),
        used: 0
      });
    }

    const previousBalance = balance.balance;
    balance.balance += Number(adjustment);
    balance.total += Number(adjustment);
    await balance.save();

    await AuditLog.create({
      tenantId: req.tenantId,
      action: 'LEAVE_BALANCE_ADJUST',
      performedBy: req.user._id,
      targetEmployee: employeeId,
      details: `Adjusted balance by ${adjustment}. Reason: ${reason}. Previous: ${previousBalance}, New: ${balance.balance}`
    });

    res.json({ message: 'Balance adjusted successfully', balance: balance.balance });
  } catch (error) {
    next(error);
  }
};

// @desc    Run Year-End Carry Forward
// @route   POST /api/leaves/policies/carry-forward
// @access  Private (HR Admin)
const runCarryForward = async (req, res, next) => {
  try {
    const policies = await LeavePolicy.find({ tenantId: req.tenantId });
    const balances = await LeaveBalance.find({ tenantId: req.tenantId });

    for (const balance of balances) {
      const policy = policies.find(p => p.leaveTypeId.toString() === balance.leaveTypeId.toString());
      if (policy) {
        const carriedOver = Math.min(balance.balance, policy.carryForwardLimit || 0);
        const newBalance = policy.annualAllowance + carriedOver;
        balance.balance = newBalance;
        balance.total = newBalance;
        balance.used = 0;
        await balance.save();
      }
    }

    await AuditLog.create({
      tenantId: req.tenantId,
      action: 'LEAVE_CARRY_FORWARD',
      performedBy: req.user._id,
      details: 'Ran year-end carry forward for all employees.'
    });

    res.json({ message: 'Year-End Carry Forward completed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeavePolicies,
  createUpdateLeavePolicy,
  backfillBalances,
  adjustBalance,
  runCarryForward
};
