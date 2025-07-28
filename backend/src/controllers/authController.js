const bcrypt = require('bcryptjs');
const { getDatabase } = require('../lib/db');
const { generateToken } = require('../middleware/auth');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, first_name, last_name } = req.body;

      // Validate required fields
      if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const db = getDatabase();
      
      // Check if user already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert user
      const insertUser = db.prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, role) 
        VALUES (?, ?, ?, ?, ?)
      `);
      
      const result = insertUser.run(email, hashedPassword, first_name, last_name, 'customer');
      
      // Get the created user
      const newUser = db.prepare('SELECT id, email, first_name, last_name, role FROM users WHERE id = ?').get(result.lastInsertRowid);
      
      // Generate token
      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        user: newUser,
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const db = getDatabase();
      
      // Find user
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate token
      const userForToken = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      };
      
      const token = generateToken(userForToken);

      res.json({
        success: true,
        user: userForToken,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async getMe(req, res) {
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
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    }
  }
}

module.exports = AuthController; 