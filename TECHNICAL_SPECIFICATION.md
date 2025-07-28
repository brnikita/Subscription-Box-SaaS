# Subscription Box Management Platform - Technical Specification (MVP)

## 1. Project Overview

### 1.1 Purpose
A minimalistic subscription box management platform MVP that can be built and run locally in a single day, with core subscription and payment simulation features.

### 1.2 Core Objectives
- Basic customer subscription management
- Simulated payment processing (with Stripe fallback)
- Simple admin panel for basic operations
- Local development environment only

## 2. Technical Architecture

### 2.1 Technology Stack

**Frontend:**
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **State Management:** React useState/useContext
- **Forms:** Basic React forms with validation
- **HTTP Client:** Native fetch

**Backend:**
- **Runtime:** Node.js 18+
- **Framework:** Next.js API routes (full-stack approach)
- **Authentication:** Simple session-based auth
- **Validation:** Basic JavaScript validation
- **File Upload:** Local file system storage

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
- **Pattern:** Next.js full-stack application
- **API Design:** Next.js API routes
- **Authentication:** Session-based with cookies
- **Database:** Single SQLite file

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

## 4. API Specifications (Next.js API Routes)

### 4.1 Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
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
PUT /api/admin/products/[id]
```

### 4.5 Payments (Mock)
```
POST /api/payments/simulate
GET /api/payments/history
```

## 5. Minimalistic Features

### 5.1 User Authentication
- **Registration:** Email/password only
- **Login:** Session-based authentication
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

### 6.1 Phase 1: Setup (1-2 hours)
1. Create Next.js project
2. Setup SQLite database
3. Create basic database schema
4. Setup environment variables

### 6.2 Phase 2: Authentication (1-2 hours)
1. Implement registration/login
2. Session management
3. Basic middleware

### 6.3 Phase 3: Core Features (2-3 hours)
1. Customer dashboard
2. Subscription management
3. Mock payment system

### 6.4 Phase 4: Admin & Polish (1-2 hours)
1. Basic admin panel
2. Landing page
3. Styling with Tailwind

## 7. Development Environment

### 7.1 Local Setup
```bash
# Create project
npx create-next-app@latest subscription-box --typescript --tailwind --app
cd subscription-box

# Install dependencies
npm install better-sqlite3 bcryptjs jsonwebtoken

# Setup database
node scripts/init-db.js

# Run development
npm run dev
```

### 7.2 Environment Variables (.env.local)
```env
# Database
DATABASE_PATH=./data/app.db

# Authentication
JWT_SECRET=your-local-jwt-secret-key-here
SESSION_SECRET=your-session-secret-here

# Payment (Optional - for future Stripe integration)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Mock Payment Settings
MOCK_PAYMENTS=true
```

### 7.3 Environment Template (.env.example)
```env
# Database
DATABASE_PATH=./data/app.db

# Authentication
JWT_SECRET=generate-a-random-secret-key
SESSION_SECRET=generate-another-random-secret

# Payment (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password

# Features
MOCK_PAYMENTS=true
```

## 8. File Structure
```
subscription-box/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── admin/
│   │   │   ├── plans/
│   │   │   └── payments/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   └── page.tsx (landing)
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── db.js
│   │   ├── auth.js
│   │   └── utils.js
│   └── types/
├── data/
│   └── app.db (SQLite)
├── scripts/
│   └── init-db.js
├── .env.local
├── .env.example
└── package.json
```

## 9. Deployment Strategy (Local Only)

### 9.1 Local Development
- **Database:** SQLite file in `./data/` directory
- **Files:** Local filesystem storage
- **Environment:** Node.js development server

### 9.2 Production Considerations (Future)
- **Database:** Migrate to PostgreSQL
- **Hosting:** Vercel/Netlify when ready
- **Payments:** Enable real Stripe integration
- **Storage:** Cloud storage for files

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

---

This minimalistic specification is designed for rapid development using AI assistance, focusing on core functionality that can be implemented in a single day while maintaining the ability to scale up later. 