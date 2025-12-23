const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { authenticate, isAdmin, validate } = require('../middleware');
const {
  userIdValidation,
  updateRoleValidation,
  removeAuctionValidation,
} = require('../validators');

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', userIdValidation, validate, adminController.getUserById);
router.post('/users/:id/ban', userIdValidation, validate, adminController.banUser);
router.post('/users/:id/unban', userIdValidation, validate, adminController.unbanUser);
router.put('/users/:id/role', updateRoleValidation, validate, adminController.updateUserRole);

// Auction management
router.get('/auctions', adminController.getAuctions);
router.delete('/auctions/:id', removeAuctionValidation, validate, adminController.removeAuction);

module.exports = router;
