const express = require('express');
const router = express.Router();
const { applyLeave, getLeaveBalance, getMyLeaves, cancelLeave, getAllLeavesAdmin } = require('../controllers/leaveController');
const { getLeavePolicies, createUpdateLeavePolicy, backfillBalances, adjustBalance, runCarryForward } = require('../controllers/leavePolicyController');
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');

router.use(protect);
router.use(tenantMiddleware);

router.route('/apply').post(applyLeave);
router.route('/balance').get(getLeaveBalance);
router.route('/my-requests').get(getMyLeaves);
router.route('/admin/all').get(getAllLeavesAdmin);
router.route('/:id/cancel').patch(cancelLeave);

// Policy routes
router.route('/policies').get(getLeavePolicies).post(createUpdateLeavePolicy);
router.route('/policies/backfill').post(backfillBalances);
router.route('/policies/carry-forward').post(runCarryForward);
router.route('/admin/adjust-balance').post(adjustBalance);

module.exports = router;
