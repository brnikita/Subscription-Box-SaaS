require('dotenv').config();
const { initDatabase } = require('../src/lib/db');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    initDatabase();
    console.log('✅ Database initialized successfully!');
    console.log('📋 Tables created');
    console.log(`👤 Default admin user created: ${process.env.ADMIN_EMAIL || 'admin@example.com'} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('📦 Sample subscription plans added');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 