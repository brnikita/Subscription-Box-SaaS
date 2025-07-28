import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { plansAPI, paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getPlans();
      setPlans(response.data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelection = async (plan) => {
    if (!isAuthenticated()) {
      // Store selected plan and redirect to register
      localStorage.setItem('selectedPlan', JSON.stringify(plan));
      navigate('/register');
      return;
    }

    // Process subscription for authenticated users
    try {
      setProcessingPayment(plan.id);
      
      const response = await paymentAPI.processPayment({
        plan_id: plan.id,
        amount: plan.price
      });

      if (response.data.success) {
        alert(`Successfully subscribed to ${plan.name}! Welcome to your new subscription.`);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to process subscription';
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">BoxSubscribe</h1>
            </div>
            <div className="flex space-x-4">
              {isAuthenticated() ? (
                <>
                  <span className="text-gray-600 px-3 py-2 text-sm">
                    Welcome, {user?.first_name}!
                  </span>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">
              Discover Amazing Products Every Month
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Get curated subscription boxes delivered to your door. From beauty to tech, 
              we have the perfect box for everyone.
            </p>
            {!isAuthenticated() && (
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold inline-block"
              >
                Start Your Subscription
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h3>
            <p className="text-lg text-gray-600">
              Select the subscription that fits your lifestyle and budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-lg p-8 border">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">
                    {plan.name}
                  </h4>
                  <p className="text-gray-600 mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">
                      /{plan.billing_interval}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePlanSelection(plan)}
                    disabled={processingPayment === plan.id}
                    className={`w-full py-3 rounded-lg font-semibold text-center ${
                      processingPayment === plan.id
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {processingPayment === plan.id ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : isAuthenticated() ? (
                      'Subscribe Now'
                    ) : (
                      'Choose This Plan'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Choose Your Plan</h4>
              <p className="text-gray-600">
                Select from our carefully curated subscription plans
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Get Your Box</h4>
              <p className="text-gray-600">
                Receive your surprise box delivered right to your door
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Enjoy & Discover</h4>
              <p className="text-gray-600">
                Discover new products and enjoy your monthly surprises
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">BoxSubscribe</h3>
            <p className="text-gray-400">
              Bringing you the best products every month
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 