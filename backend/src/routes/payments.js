const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All payment routes require authentication
router.use(authenticateToken);

router.post('/simulate', PaymentController.processPayment);
router.get('/history', PaymentController.getPaymentHistory);

module.exports = router; 