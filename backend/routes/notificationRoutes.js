const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Notification endpoints
router.get('/', notificationController.getNotifications);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

// Notification preference endpoints
router.get('/preferences/me', notificationController.getUserPreferences);
router.put('/preferences/me', notificationController.updateUserPreferences);

module.exports = router;
