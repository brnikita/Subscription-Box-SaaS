const express = require('express');
const PlanController = require('../controllers/planController');

const router = express.Router();

// Public routes
router.get('/', PlanController.getPlans);
router.get('/:id', PlanController.getPlan);

module.exports = router; 