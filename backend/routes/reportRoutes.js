const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/overtime', authorize('HR Admin', 'Leadership'), reportController.getOvertimeReport);
router.get('/attrition', authorize('HR Admin', 'Leadership'), reportController.getAttritionReport);

module.exports = router;
