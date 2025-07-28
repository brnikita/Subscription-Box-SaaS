# Subscription Box Management Platform - Technical Specification (MVP)

## 1. Project Overview

### 1.1 Purpose
A minimalistic subscription box management platform MVP that can be built and run locally in a single day, with core subscription and payment simulation features using separate frontend and backend applications.

### 1.2 Core Objectives
- Basic customer subscription management
- Simulated payment processing (with Stripe fallback)
- Simple admin panel for basic operations
- Local development environment only
- Separate frontend and backend applications

## 2. Technical Architecture

### 2.1 Technology Stack

**Frontend:**
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **State Management:** React useState/useContext
- **Forms:** Basic React forms with validation
- **HTTP Client:** Axios
- **Routing:** React Router DOM

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Authentication:** JWT tokens
- **Validation:** Basic JavaScript validation
- **File Upload:** Local file system storage
- **CORS:** Express CORS middleware

**Database:**
- **Primary:** SQLite (local file-based database)
- **ORM:** None (raw SQL with better-sqlite3)
- **Migrations:** Simple SQL scripts

**Payment Processing:**
- **Development:** Mock payment simulation
- **Production Ready:** Stripe integration (optional)
- **Fallback:** Local payment status tracking

**Infrastructure:**
- **Hosting:** Local development only
- **File Storage:** Local filesystem
- **Environment:** Docker optional, Node.js direct

### 2.2 Architecture Pattern
- **Pattern:** Separate frontend and backend applications
- **API Design:** RESTful APIs with Express.js
- **Authentication:** JWT-based authentication
- **Database:** Single SQLite file
- **Communication:** HTTP REST APIs between frontend and backend

## 3. Database Schema (SQLite)

### 3.1 Core Tables

```sql
-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  billing_interval TEXT DEFAULT 'monthly' CHECK(billing_interval IN ('monthly', 'quarterly', 'annually')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer subscriptions
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER REFERENCES subscription_plans(id),
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'paused', 'cancelled', 'past_due')),
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products (simplified)
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders (simplified)
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER REFERENCES subscriptions(id),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'shipped', 'delivered')),
  total_amount DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment simulation
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'failed')),
  payment_method TEXT DEFAULT 'card',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Specifications (Express.js REST APIs)

### 4.1 Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### 4.2 Customer
```
GET /api/customer/profile
PUT /api/customer/profile
GET /api/customer/subscription
POST /api/customer/subscription/pause
POST /api/customer/subscription/resume
POST /api/customer/subscription/cancel
GET /api/customer/orders
```

### 4.3 Plans
```
GET /api/plans
```

### 4.4 Admin
```
GET /api/admin/dashboard
GET /api/admin/customers
GET /api/admin/subscriptions
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/:id
```

### 4.5 Payments (Mock)
```
POST /api/payments/simulate
GET /api/payments/history
```

## 5. Minimalistic Features

### 5.1 User Authentication
- **Registration:** Email/password only
- **Login:** JWT-based authentication
- **Roles:** Customer vs Admin (hardcoded admin user)

### 5.2 Customer Dashboard
- **Subscription Status:** Current plan and status
- **Basic Profile:** Name and email editing
- **Subscription Controls:** Pause, resume, cancel buttons
- **Order History:** Simple list view

### 5.3 Subscription Management
- **Plan Selection:** Choose from 3 predefined plans
- **Status Changes:** Basic pause/resume/cancel
- **Payment Simulation:** Mock successful payments

### 5.4 Payment Processing (Simulated)
- **Mock Payments:** Simulate successful transactions
- **Payment History:** Track simulated payments
- **Stripe Integration:** Optional environment variable

### 5.5 Admin Panel (Basic)
- **Dashboard:** Simple metrics (user count, active subscriptions)
- **Customer List:** Basic user management
- **Product Management:** Add/edit basic products
- **Subscription Overview:** View all subscriptions

### 5.6 Landing Page (Simple)
- **Hero Section:** Basic value proposition
- **Pricing:** Show 3 subscription plans
- **Sign Up Form:** Direct registration

## 6. Implementation Plan (Single Day)

### 6.1 Phase 1: Backend Setup (1-2 hours)
1. Create Express.js project
2. Setup SQLite database
3. Create basic database schema
4. Setup environment variables
5. Implement authentication middleware

### 6.2 Phase 2: API Development (2-3 hours)
1. Authentication endpoints
2. Customer management APIs
3. Subscription management APIs
4. Admin APIs
5. Mock payment system

### 6.3 Phase 3: Frontend Setup (1-2 hours)
1. Create React project with Vite
2. Setup routing with React Router
3. Configure Tailwind CSS
4. Create basic components

### 6.4 Phase 4: Frontend Features (1-2 hours)
1. Landing page
2. Authentication pages
3. Customer dashboard
4. Admin panel

## 7. Development Environment

### 7.1 Backend Setup
```bash
# Create backend project
mkdir subscription-box-backend
cd subscription-box-backend
npm init -y

# Install dependencies
npm install express cors helmet morgan bcryptjs jsonwebtoken better-sqlite3 dotenv

# Install dev dependencies
npm install -D nodemon

# Setup database
node scripts/init-db.js

# Run development server
npm run dev
```

### 7.2 Frontend Setup
```bash
# Create frontend project
npm create vite@latest subscription-box-frontend -- --template react
cd subscription-box-frontend

# Install dependencies
npm install
npm install axios react-router-dom

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Run development server
npm run dev
```

### 7.3 Backend Environment Variables (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./data/app.db

# Authentication
JWT_SECRET=your-local-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:3000

# Payment (Optional - for future Stripe integration)
STRIPE_SECRET_KEY=sk_test_your_key_here

# App Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Mock Payment Settings
MOCK_PAYMENTS=true
```

### 7.4 Frontend Environment Variables (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_URL=http://localhost:3000

# Payment (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

## 8. File Structure

### 8.1 Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── adminController.js
│   │   ├── planController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customer.js
│   │   ├── admin.js
│   │   ├── plans.js
│   │   └── payments.js
│   ├── lib/
│   │   ├── db.js
│   │   └── utils.js
│   └── app.js
├── scripts/
│   └── init-db.js
├── data/
│   └── app.db (SQLite)
├── .env
├── .env.example
├── package.json
└── server.js
```

### 8.2 Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Loading.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   ├── dashboard/
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── SubscriptionCard.jsx
│   │   │   └── PlanSelector.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       └── StatsCard.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── Admin.jsx
│   ├── services/
│   │   └── api.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 9. Deployment Strategy (Local Only)

### 9.1 Local Development
- **Backend:** Express server on port 5000
- **Frontend:** Vite dev server on port 3000
- **Database:** SQLite file in `./data/` directory
- **Files:** Local filesystem storage

### 9.2 Production Considerations (Future)
- **Backend:** Deploy to Railway/Render/Heroku
- **Frontend:** Deploy to Vercel/Netlify
- **Database:** Migrate to PostgreSQL
- **Payments:** Enable real Stripe integration

## 10. Mock Payment System

### 10.1 Payment Simulation
```javascript
// Mock payment processing
const simulatePayment = (amount, paymentMethod) => {
  return {
    success: true,
    transactionId: `mock_${Date.now()}`,
    amount,
    status: 'completed'
  };
};
```

### 10.2 Stripe Integration (Optional)
```javascript
// When STRIPE_SECRET_KEY is provided
const stripe = process.env.STRIPE_SECRET_KEY ? 
  require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

const processPayment = async (amount) => {
  if (process.env.MOCK_PAYMENTS === 'true' || !stripe) {
    return simulatePayment(amount);
  }
  // Real Stripe processing
  return await stripe.paymentIntents.create({ amount });
};
```

## 11. Success Criteria (MVP)

### 11.1 Core Functionality
- ✅ User can register and login
- ✅ User can view subscription plans
- ✅ User can subscribe to a plan (simulated payment)
- ✅ User can manage subscription (pause/resume/cancel)
- ✅ Admin can view customers and subscriptions
- ✅ Basic dashboard for both users and admin

### 11.2 Technical Requirements
- ✅ Runs completely locally
- ✅ No external service dependencies
- ✅ Simple SQLite database
- ✅ Environment variables for configuration
- ✅ Mock payment system with Stripe fallback
- ✅ Separate frontend and backend applications
- ✅ RESTful API communication

---

This minimalistic specification is designed for rapid development using AI assistance, focusing on core functionality that can be implemented in a single day with separate frontend and backend applications while maintaining the ability to scale up later. 