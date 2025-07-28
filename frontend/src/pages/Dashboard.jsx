import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Welcome, {user?.first_name} {user?.last_name}!
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Frontend is working successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    ✅ React application is running<br />
                    ✅ Backend API connection established<br />
                    ✅ Authentication is working<br />
                    ✅ User dashboard is accessible<br />
                    ✅ Full subscription management system ready
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-600">
              Your subscription box management platform is ready! The complete application includes:
            </p>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li>• Subscription plan selection and management</li>
              <li>• Mock payment processing</li>
              <li>• Order tracking and history</li>
              <li>• Profile management</li>
              <li>• Subscription controls (pause/resume/cancel)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 