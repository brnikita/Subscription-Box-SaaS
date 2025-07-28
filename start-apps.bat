@echo off
echo Starting Subscription Box Management Platform...
echo.

echo Creating environment files...

echo # Server Configuration > backend\.env
echo PORT=5000 >> backend\.env
echo NODE_ENV=development >> backend\.env
echo. >> backend\.env
echo # Database >> backend\.env
echo DATABASE_PATH=./data/app.db >> backend\.env
echo. >> backend\.env
echo # Authentication >> backend\.env
echo JWT_SECRET=your-local-jwt-secret-key-here-very-secure-random-string >> backend\.env
echo JWT_EXPIRES_IN=24h >> backend\.env
echo. >> backend\.env
echo # CORS >> backend\.env
echo FRONTEND_URL=http://localhost:3000 >> backend\.env
echo. >> backend\.env
echo # App Configuration >> backend\.env
echo ADMIN_EMAIL=admin@example.com >> backend\.env
echo ADMIN_PASSWORD=admin123 >> backend\.env
echo. >> backend\.env
echo # Mock Payment Settings >> backend\.env
echo MOCK_PAYMENTS=true >> backend\.env

echo # API Configuration > frontend\.env
echo VITE_API_URL=http://localhost:5000/api >> frontend\.env
echo. >> frontend\.env
echo # App Configuration >> frontend\.env
echo VITE_APP_URL=http://localhost:3000 >> frontend\.env

echo Environment files created!
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo Initializing database...
call npm run init-db
if %errorlevel% neq 0 (
    echo Failed to initialize database
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Starting applications...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
echo Admin login: admin@example.com / admin123
echo.

start "Backend Server" cmd /k "cd /d %cd%\..\backend && npm run dev"
start "Frontend Server" cmd /k "cd /d %cd% && npm run dev"

echo Both applications are starting...
echo Check the new command windows for logs.
echo.
pause 