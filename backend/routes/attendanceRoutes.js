const express = require('express');
const router = express.Router();
const { punchAttendance, getMyAttendance, getAllAttendance, requestRegularization, getMonthlyRegister } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantMiddleware);

router.route('/punch').post(punchAttendance);
router.route('/my-records').get(getMyAttendance);
router.route('/all').get(getAllAttendance);
router.route('/regularize').post(requestRegularization);
router.route('/register').get(getMonthlyRegister);

module.exports = router;
