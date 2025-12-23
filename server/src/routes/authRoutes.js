const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate, validate } = require('../middleware');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../validators');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, updateProfileValidation, validate, authController.updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, validate, authController.changePassword);

module.exports = router;
