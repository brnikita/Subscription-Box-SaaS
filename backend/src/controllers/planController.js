const { getDatabase } = require('../lib/db');

class PlanController {
  static async getPlans(req, res) {
    try {
      const db = getDatabase();
      const plans = db.prepare('SELECT * FROM subscription_plans WHERE is_active = 1').all();
      
      res.json({
        success: true,
        plans
      });
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({ error: 'Failed to fetch plans' });
    }
  }

  static async getPlan(req, res) {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const plan = db.prepare('SELECT * FROM subscription_plans WHERE id = ? AND is_active = 1').get(id);
      
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.json({
        success: true,
        plan
      });
    } catch (error) {
      console.error('Get plan error:', error);
      res.status(500).json({ error: 'Failed to fetch plan' });
    }
  }
}

module.exports = PlanController; 