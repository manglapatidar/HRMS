const Shift = require('../models/Shift');
const Employee = require('../models/Employee');

// @desc    Get all shifts
// @route   GET /api/shifts
// @access  Private
const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find({ tenantId: req.tenantId }).sort({ createdAt: 1 });
    res.json(shifts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new shift
// @route   POST /api/shifts
// @access  Private (HR Admin)
const createShift = async (req, res, next) => {
  try {
    if (req.user.role !== 'HR Admin') {
      return res.status(403).json({ message: 'Access denied. HR Admin only.' });
    }

    const { name, startTime, endTime, gracePeriod, isDefault } = req.body;

    if (!name || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide shift name, start time, and end time' });
    }

    // If setting this shift as default, unset other default shifts for this tenant
    if (isDefault) {
      await Shift.updateMany({ tenantId: req.tenantId }, { isDefault: false });
    }

    // If it's the first shift created, force it to be default
    const count = await Shift.countDocuments({ tenantId: req.tenantId });
    const shiftIsDefault = count === 0 ? true : !!isDefault;

    const shift = await Shift.create({
      tenantId: req.tenantId,
      name,
      startTime,
      endTime,
      gracePeriod: gracePeriod !== undefined ? parseInt(gracePeriod) : 15,
      isDefault: shiftIsDefault,
    });

    res.status(201).json(shift);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a shift
// @route   PUT /api/shifts/:id
// @access  Private (HR Admin)
const updateShift = async (req, res, next) => {
  try {
    if (req.user.role !== 'HR Admin') {
      return res.status(403).json({ message: 'Access denied. HR Admin only.' });
    }

    const { name, startTime, endTime, gracePeriod, isDefault } = req.body;
    const shift = await Shift.findOne({ _id: req.params.id, tenantId: req.tenantId });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // If setting as default, unset others first
    if (isDefault && !shift.isDefault) {
      await Shift.updateMany({ tenantId: req.tenantId }, { isDefault: false });
      shift.isDefault = true;
    } else if (isDefault === false && shift.isDefault) {
      // Cannot unset default if it's the only default shift, unless we set another one first.
      // But we can let them unset if they want. Let's make sure at least one shift remains default if possible.
      // For now, let's keep it simple: if they unset default, we'll allow it.
      shift.isDefault = false;
    }

    if (name) shift.name = name;
    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;
    if (gracePeriod !== undefined) shift.gracePeriod = parseInt(gracePeriod);

    await shift.save();
    res.json(shift);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a shift
// @route   DELETE /api/shifts/:id
// @access  Private (HR Admin)
const deleteShift = async (req, res, next) => {
  try {
    if (req.user.role !== 'HR Admin') {
      return res.status(403).json({ message: 'Access denied. HR Admin only.' });
    }

    const shift = await Shift.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Prevent deletion if any active employee is currently assigned to this shift
    const employeeWithShift = await Employee.findOne({ tenantId: req.tenantId, shiftId: shift._id, status: { $ne: 'Exited' } });
    if (employeeWithShift) {
      return res.status(400).json({ message: 'Cannot delete shift because employees are currently assigned to it.' });
    }

    await Shift.deleteOne({ _id: shift._id });
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
};
