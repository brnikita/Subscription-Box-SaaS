const { getDatabase } = require('../lib/db');

class PaymentController {
  static simulatePayment(amount, paymentMethod = 'card') {
    // Mock payment processing - always succeeds for MVP
    return {
      success: true,
      transactionId: `mock_${Date.now()}`,
      amount,
      status: 'completed',
      paymentMethod
    };
  }

  static async processPayment(req, res) {
    try {
      const { plan_id, amount } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!plan_id || !amount) {
        return res.status(400).json({ error: 'Plan ID and amount are required' });
      }

      const db = getDatabase();

      // Check if user already has an active subscription
      const existingSubscription = db.prepare(`
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status IN ('active', 'paused')
      `).get(userId);

      if (existingSubscription) {
        return res.status(400).json({ error: 'User already has an active subscription' });
      }

      // Verify the plan exists
      const plan = db.prepare('SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1').get(plan_id);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      // Simulate payment processing
      const paymentResult = this.simulatePayment(amount);

      if (!paymentResult.success) {
        return res.status(400).json({ error: 'Payment failed' });
      }

      // Create subscription
      const currentDate = new Date();
      const nextBillingDate = new Date(currentDate);
      
      // Calculate next billing date based on interval
      if (plan.billing_interval === 'monthly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else if (plan.billing_interval === 'quarterly') {
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
      } else if (plan.billing_interval === 'annually') {
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      const insertSubscription = db.prepare(`
        INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end) 
        VALUES (?, ?, 'active', ?, ?)
      `);
      
      const subscriptionResult = insertSubscription.run(
        userId, 
        plan_id, 
        currentDate.toISOString(), 
        nextBillingDate.toISOString()
      );

      // Record payment
      const insertPayment = db.prepare(`
        INSERT INTO payments (subscription_id, amount, status, payment_method) 
        VALUES (?, ?, 'completed', 'card')
      `);
      
      insertPayment.run(subscriptionResult.lastInsertRowid, amount);

      // Create initial order
      const insertOrder = db.prepare(`
        INSERT INTO orders (subscription_id, status, total_amount) 
        VALUES (?, 'pending', ?)
      `);
      
      insertOrder.run(subscriptionResult.lastInsertRowid, amount);

      // Get the created subscription with plan details
      const newSubscription = db.prepare(`
        SELECT s.*, sp.name as plan_name, sp.price as plan_price, sp.billing_interval 
        FROM subscriptions s 
        JOIN subscription_plans sp ON s.plan_id = sp.id 
        WHERE s.id = ?
      `).get(subscriptionResult.lastInsertRowid);

      res.status(201).json({
        success: true,
        transaction_id: paymentResult.transactionId,
        subscription: newSubscription,
        message: 'Payment processed successfully (simulated)'
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const db = getDatabase();
      const payments = db.prepare(`
        SELECT p.*, s.id as subscription_id, sp.name as plan_name
        FROM payments p
        JOIN subscriptions s ON p.subscription_id = s.id
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = ?
        ORDER BY p.created_at DESC
      `).all(req.user.id);

      res.json({
        success: true,
        payments
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({ error: 'Failed to fetch payment history' });
    }
  }
}

module.exports = PaymentController; 