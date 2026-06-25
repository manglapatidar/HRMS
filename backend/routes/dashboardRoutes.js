const express = require('express');
const router = express.Router();
const { getDashboardStats, getWorkforceAnalytics, getTeamReports } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantMiddleware);

router.route('/stats').get(getDashboardStats);
router.route('/workforce-analytics').get(getWorkforceAnalytics);
router.route('/team-reports').get(getTeamReports);

module.exports = router;
