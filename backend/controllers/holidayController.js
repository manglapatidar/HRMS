const Holiday = require('../models/Holiday');

// @desc    Get all holidays
// @route   GET /api/holidays
// @access  Private
const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find({ tenantId: req.tenantId }).sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new holiday
// @route   POST /api/holidays
// @access  Private (HR Admin)
const createHoliday = async (req, res, next) => {
  try {
    if (req.user.role !== 'HR Admin') {
      return res.status(403).json({ message: 'Access denied. HR Admin only.' });
    }

    const { name, date } = req.body;

    if (!name || !date) {
      return res.status(400).json({ message: 'Please provide holiday name and date' });
    }

    // Parse date into start of day UTC
    const holidayDate = new Date(date);
    holidayDate.setUTCHours(0, 0, 0, 0);

    // Check if a holiday already exists on this date for this tenant
    const exists = await Holiday.findOne({ tenantId: req.tenantId, date: holidayDate });
    if (exists) {
      return res.status(400).json({ message: 'A holiday already exists on this date' });
    }

    const holiday = await Holiday.create({
      tenantId: req.tenantId,
      name,
      date: holidayDate,
    });

    res.status(201).json(holiday);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private (HR Admin)
const deleteHoliday = async (req, res, next) => {
  try {
    if (req.user.role !== 'HR Admin') {
      return res.status(403).json({ message: 'Access denied. HR Admin only.' });
    }

    const holiday = await Holiday.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await Holiday.deleteOne({ _id: holiday._id });
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  deleteHoliday,
};
