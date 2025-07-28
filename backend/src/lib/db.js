const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let db = null;

function initDatabase() {
  try {
    const dbPath = path.join(__dirname, '../../data/app.db');
    
    // Create data directory if it doesn't exist
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create tables
    createTables();
    
    // Insert default data
    insertDefaultData();
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

function createTables() {
  const schemas = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS subscription_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      billing_interval TEXT DEFAULT 'monthly' CHECK(billing_interval IN ('monthly', 'quarterly', 'annually')),
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      plan_id INTEGER REFERENCES subscription_plans(id),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'cancelled', 'past_due')),
      current_period_start DATETIME,
      current_period_end DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10,2),
      stock_quantity INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER REFERENCES subscriptions(id),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered')),
      total_amount DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscription_id INTEGER REFERENCES subscriptions(id),
      amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'failed')),
      payment_method TEXT DEFAULT 'card',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  schemas.forEach(schema => {
    db.exec(schema);
  });
}

function insertDefaultData() {
  // Insert default subscription plans
  const plansCount = db.prepare("SELECT COUNT(*) as count FROM subscription_plans").get();
  if (plansCount.count === 0) {
    const insertPlan = db.prepare(`
      INSERT INTO subscription_plans (name, description, price, billing_interval) 
      VALUES (?, ?, ?, ?)
    `);
    
    const plans = [
      ['Basic Box', 'Monthly surprise box with 3-5 items', 19.99, 'monthly'],
      ['Premium Box', 'Monthly premium box with 5-7 high-quality items', 39.99, 'monthly'],
      ['Annual Box', 'Annual subscription with 12 boxes and exclusive items', 199.99, 'annually']
    ];

    plans.forEach(plan => {
      insertPlan.run(...plan);
    });
  }

  // Insert default admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
  if (adminCount.count === 0) {
    const hashedPassword = bcrypt.hashSync(adminPassword, 10);
    const insertAdmin = db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role) 
      VALUES (?, ?, ?, ?, ?)
    `);
    insertAdmin.run(adminEmail, hashedPassword, 'Admin', 'User', 'admin');
  }
}

function getDatabase() {
  if (!db) {
    initDatabase();
  }
  return db;
}

module.exports = {
  initDatabase,
  getDatabase
}; 