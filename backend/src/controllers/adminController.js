const { getDatabase } = require('../lib/db');

class AdminController {
  static async getDashboardStats(req, res) {
    try {
      const db = getDatabase();
      
      // Get total users count
      const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;
      
      // Get subscription counts by status
      const activeSubscriptions = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'").get().count;
      const pausedSubscriptions = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'paused'").get().count;
      const cancelledSubscriptions = db.prepare("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'cancelled'").get().count;
      
      // Get total revenue
      const totalRevenue = db.prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'").get().total || 0;
      
      // Get total orders
      const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get().count;

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeSubscriptions,
          pausedSubscriptions,
          cancelledSubscriptions,
          totalRevenue,
          totalOrders
        }
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }

  static async getCustomers(req, res) {
    try {
      const db = getDatabase();
      const customers = db.prepare(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.created_at,
               s.status as subscription_status, sp.name as plan_name
        FROM users u
        LEFT JOIN subscriptions s ON u.id = s.user_id
        LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
        WHERE u.role = 'customer'
        ORDER BY u.created_at DESC
      `).all();

      res.json({
        success: true,
        customers
      });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  }

  static async getSubscriptions(req, res) {
    try {
      const db = getDatabase();
      const subscriptions = db.prepare(`
        SELECT s.*, u.email, u.first_name, u.last_name, sp.name as plan_name, sp.price
        FROM subscriptions s
        JOIN users u ON s.user_id = u.id
        JOIN subscription_plans sp ON s.plan_id = sp.id
        ORDER BY s.created_at DESC
      `).all();

      res.json({
        success: true,
        subscriptions
      });
    } catch (error) {
      console.error('Get subscriptions error:', error);
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
  }

  static async getProducts(req, res) {
    try {
      const db = getDatabase();
      const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();

      res.json({
        success: true,
        products
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  static async createProduct(req, res) {
    try {
      const { name, description, price, stock_quantity } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
      }

      const db = getDatabase();
      const insertProduct = db.prepare(`
        INSERT INTO products (name, description, price, stock_quantity) 
        VALUES (?, ?, ?, ?)
      `);
      
      const result = insertProduct.run(name, description, price, stock_quantity || 0);
      
      const newProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

      res.status(201).json({
        success: true,
        product: newProduct,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, stock_quantity, is_active } = req.body;

      const db = getDatabase();
      
      // Check if product exists
      const existingProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const updateProduct = db.prepare(`
        UPDATE products 
        SET name = ?, description = ?, price = ?, stock_quantity = ?, is_active = ?
        WHERE id = ?
      `);
      
      updateProduct.run(
        name || existingProduct.name,
        description || existingProduct.description,
        price || existingProduct.price,
        stock_quantity !== undefined ? stock_quantity : existingProduct.stock_quantity,
        is_active !== undefined ? is_active : existingProduct.is_active,
        id
      );
      
      const updatedProduct = db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      res.json({
        success: true,
        product: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
}

module.exports = AdminController; 