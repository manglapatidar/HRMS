const express = require('express');
const router = express.Router();
const { loginUser, registerCompany, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/company-signup', registerCompany);
router.put('/change-password', protect, changePassword);

module.exports = router;
