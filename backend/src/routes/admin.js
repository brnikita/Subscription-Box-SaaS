const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.getDashboardStats);

// Customer management
router.get('/customers', AdminController.getCustomers);
router.get('/subscriptions', AdminController.getSubscriptions);

// Product management
router.get('/products', AdminController.getProducts);
router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);

module.exports = router; 