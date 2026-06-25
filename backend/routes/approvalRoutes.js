const express = require('express');
const router = express.Router();
const { getPendingApprovals, processApproval } = require('../controllers/approvalController');
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(tenantMiddleware);
router.use(authorize('Manager', 'HR Admin'));

router.route('/pending').get(getPendingApprovals);
router.route('/:id').put(processApproval);

module.exports = router;
