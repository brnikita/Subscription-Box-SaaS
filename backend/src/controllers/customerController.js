const { getDatabase } = require('../lib/db');

class CustomerController {
  static async getProfile(req, res) {
    try {
      const db = getDatabase();
      const user = db.prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?').get(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { first_name, last_name } = req.body;
      const db = getDatabase();
      
      const updateUser = db.prepare(`
        UPDATE users 
        SET first_name = ?, last_name = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      updateUser.run(first_name, last_name, req.user.id);
      
      const updatedUser = db.prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?').get(req.user.id);

      res.json({
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  static async getSubscription(req, res) {
    try {
      const db = getDatabase();
      const subscription = db.prepare(`
        SELECT s.*, sp.name as plan_name, sp.price as plan_price, sp.billing_interval 
        FROM subscriptions s 
        JOIN subscription_plans sp ON s.plan_id = sp.id 
        WHERE s.user_id = ? 
        ORDER BY s.created_at DESC 
        LIMIT 1
      `).get(req.user.id);

      res.json({
        success: true,
        subscription
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  }

  static async pauseSubscription(req, res) {
    try {
      const db = getDatabase();
      
      // Check if user has an active subscription
      const subscription = db.prepare(`
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status = 'active'
      `).get(req.user.id);

      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Update subscription status
      const updateSubscription = db.prepare(`
        UPDATE subscriptions 
        SET status = 'paused', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      updateSubscription.run(subscription.id);

      res.json({
        success: true,
        message: 'Subscription paused successfully'
      });
    } catch (error) {
      console.error('Pause subscription error:', error);
      res.status(500).json({ error: 'Failed to pause subscription' });
    }
  }

  static async resumeSubscription(req, res) {
    try {
      const db = getDatabase();
      
      // Check if user has a paused subscription
      const subscription = db.prepare(`
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status = 'paused'
      `).get(req.user.id);

      if (!subscription) {
        return res.status(404).json({ error: 'No paused subscription found' });
      }

      // Update subscription status
      const updateSubscription = db.prepare(`
        UPDATE subscriptions 
        SET status = 'active', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      updateSubscription.run(subscription.id);

      res.json({
        success: true,
        message: 'Subscription resumed successfully'
      });
    } catch (error) {
      console.error('Resume subscription error:', error);
      res.status(500).json({ error: 'Failed to resume subscription' });
    }
  }

  static async cancelSubscription(req, res) {
    try {
      const db = getDatabase();
      
      // Check if user has an active or paused subscription
      const subscription = db.prepare(`
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status IN ('active', 'paused')
      `).get(req.user.id);

      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Update subscription status
      const updateSubscription = db.prepare(`
        UPDATE subscriptions 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
      
      updateSubscription.run(subscription.id);

      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ error: 'Failed to cancel subscription' });
    }
  }

  static async getOrders(req, res) {
    try {
      const db = getDatabase();
      const orders = db.prepare(`
        SELECT o.*, s.id as subscription_id, sp.name as plan_name
        FROM orders o
        JOIN subscriptions s ON o.subscription_id = s.id
        JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE s.user_id = ?
        ORDER BY o.created_at DESC
      `).all(req.user.id);

      res.json({
        success: true,
        orders
      });
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }
}

module.exports = CustomerController; 