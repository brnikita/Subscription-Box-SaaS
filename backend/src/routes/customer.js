const express = require('express');
const CustomerController = require('../controllers/customerController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All customer routes require authentication
router.use(authenticateToken);

// Profile management
router.get('/profile', CustomerController.getProfile);
router.put('/profile', CustomerController.updateProfile);

// Subscription management
router.get('/subscription', CustomerController.getSubscription);
router.post('/subscription/pause', CustomerController.pauseSubscription);
router.post('/subscription/resume', CustomerController.resumeSubscription);
router.post('/subscription/cancel', CustomerController.cancelSubscription);

// Orders
router.get('/orders', CustomerController.getOrders);

module.exports = router; 