import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { customerAPI, paymentAPI, plansAPI } from '../services/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showPlanChange, setShowPlanChange] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchSubscription(),
        fetchOrders(),
        fetchPayments(),
        fetchPlans()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await customerAPI.getSubscription();
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await customerAPI.getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getPaymentHistory();
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getPlans();
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSubscriptionAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action} your subscription?`)) {
      return;
    }

    setActionLoading(action);
    try {
      let response;
      switch (action) {
        case 'pause':
          response = await customerAPI.pauseSubscription();
          break;
        case 'resume':
          response = await customerAPI.resumeSubscription();
          break;
        case 'cancel':
          response = await customerAPI.cancelSubscription();
          break;
        default:
          return;
      }
      
      if (response.data.success) {
        alert(response.data.message);
        await fetchSubscription();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || `Failed to ${action} subscription`;
      alert(errorMessage);
    } finally {
      setActionLoading('');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setActionLoading('profile');
    try {
      const response = await customerAPI.updateProfile(profileData);
      if (response.data.success) {
        alert('Profile updated successfully!');
        setShowProfile(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      alert(errorMessage);
    } finally {
      setActionLoading('');
    }
  };

  const handlePlanChange = async (newPlanId) => {
    const newPlan = plans.find(p => p.id === newPlanId);
    if (!newPlan) return;

    // Different confirmation messages for new vs existing subscriptions
    const isNewSubscription = !subscription;
    const confirmMessage = isNewSubscription 
      ? `Subscribe to ${newPlan.name} plan for $${newPlan.price}/${newPlan.billing_interval}?`
      : `Change to ${newPlan.name} plan for $${newPlan.price}/${newPlan.billing_interval}?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setActionLoading('plan-change');
    try {
      // Cancel current subscription only if one exists
      if (!isNewSubscription) {
        await customerAPI.cancelSubscription();
      }
      
      // Create new subscription
      const response = await paymentAPI.processPayment({
        plan_id: newPlanId,
        amount: newPlan.price
      });

      if (response.data.success) {
        const successMessage = isNewSubscription 
          ? `Successfully subscribed to ${newPlan.name} plan!`
          : `Successfully changed to ${newPlan.name} plan!`;
        alert(successMessage);
        setShowPlanChange(false);
        await fetchSubscription();
        await fetchPayments();
        await fetchOrders(); // Refresh orders too
      }
    } catch (error) {
      const actionText = isNewSubscription ? 'subscribe to plan' : 'change plan';
      const errorMessage = error.response?.data?.error || `Failed to ${actionText}`;
      alert(errorMessage);
    } finally {
      setActionLoading('');
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Message */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Welcome back, {user?.first_name}!
              </h2>
              <p className="text-gray-600">
                Manage your subscription, view orders, and update your profile.
              </p>
            </div>
          </div>

          {/* Profile Management Modal */}
          {showProfile && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Update Profile</h3>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowProfile(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading === 'profile'}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {actionLoading === 'profile' ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Subscription Status</h3>
                {subscription && (
                  <button
                    onClick={() => setShowPlanChange(!showPlanChange)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Change Plan
                  </button>
                )}
              </div>

              {subscription ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Plan</p>
                      <p className="text-lg font-semibold text-gray-900">{subscription.plan_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                        subscription.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${subscription.plan_price}/{subscription.billing_interval}
                      </p>
                    </div>
                  </div>

                  {/* Subscription Controls */}
                  <div className="flex flex-wrap gap-3">
                    {subscription.status === 'active' && (
                      <button
                        onClick={() => handleSubscriptionAction('pause')}
                        disabled={actionLoading === 'pause'}
                        className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 disabled:bg-gray-200"
                      >
                        {actionLoading === 'pause' ? 'Pausing...' : 'Pause Subscription'}
                      </button>
                    )}
                    
                    {subscription.status === 'paused' && (
                      <button
                        onClick={() => handleSubscriptionAction('resume')}
                        disabled={actionLoading === 'resume'}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:bg-gray-200"
                      >
                        {actionLoading === 'resume' ? 'Resuming...' : 'Resume Subscription'}
                      </button>
                    )}
                    
                    {(subscription.status === 'active' || subscription.status === 'paused') && (
                      <button
                        onClick={() => handleSubscriptionAction('cancel')}
                        disabled={actionLoading === 'cancel'}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:bg-gray-200"
                      >
                        {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
                      </button>
                    )}
                  </div>

                  {/* Plan Change Options */}
                  {showPlanChange && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Available Plans</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.filter(plan => plan.id !== subscription.plan_id).map((plan) => (
                          <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900">{plan.name}</h5>
                            <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                            <p className="text-lg font-semibold text-gray-900 mb-3">
                              ${plan.price}/{plan.billing_interval}
                            </p>
                            <button
                              onClick={() => handlePlanChange(plan.id)}
                              disabled={actionLoading === 'plan-change'}
                              className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                            >
                              {actionLoading === 'plan-change' ? 'Changing...' : 'Select This Plan'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6">
                  <div className="text-center mb-6">
                    <p className="text-gray-600 mb-4">You don't have an active subscription yet.</p>
                    <p className="text-sm text-gray-500">Choose a plan below to get started:</p>
                  </div>
                  
                  {/* Available Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {plans.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <h4 className="font-medium text-gray-900 mb-2">{plan.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        <p className="text-lg font-semibold text-gray-900 mb-4">
                          ${plan.price}/{plan.billing_interval}
                        </p>
                        <button
                          onClick={() => handlePlanChange(plan.id)}
                          disabled={actionLoading === 'plan-change'}
                          className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {actionLoading === 'plan-change' ? 'Subscribing...' : 'Subscribe to This Plan'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order History and Payment History Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order History */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order History</h3>
                {orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${order.total_amount}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No orders yet</p>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)} Payment
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${payment.amount}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No payments yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mt-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Subscription Management System Active!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your subscription box management platform is fully operational with:
                  </p>
                  <ul className="mt-2 space-y-1">
                    <li>• Complete subscription management (pause/resume/cancel)</li>
                    <li>• Plan selection and upgrades/downgrades</li>
                    <li>• Order and payment history tracking</li>
                    <li>• Profile management</li>
                    <li>• Mock payment processing system</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 