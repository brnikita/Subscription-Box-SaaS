#!/bin/bash

echo "Starting Subscription Box Management Platform..."
echo ""

echo "Creating environment files..."

# Create backend .env file
cat > backend/.env << 'EOF'
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./data/app.db

# Authentication
JWT_SECRET=your-local-jwt-secret-key-here-very-secure-random-string
JWT_EXPIRES_IN=24h

# CORS
FRONTEND_URL=http://localhost:3000

# App Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Mock Payment Settings
MOCK_PAYMENTS=true
EOF

# Create frontend .env file
cat > frontend/.env << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_URL=http://localhost:3000
EOF

echo "Environment files created!"
echo ""

echo "Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

echo "Initializing database..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "Failed to initialize database"
    exit 1
fi

echo ""
echo "Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "Starting applications..."
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:3000"
echo ""
echo "Admin login: admin@example.com / admin123"
echo ""

# Start backend in background
cd ../backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Both applications are starting..."
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the applications, press Ctrl+C or run:"
echo "kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user to stop
wait 