import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { LogOut, Settings, Truck, Map, Package, Users } from 'lucide-react';
import BusManagement from './BusManagement';
import RouteManagement from './RouteManagement';
import StockManagement from './StockManagement';

type DashboardTab = 'buses' | 'routes' | 'stock';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('buses');
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setUser(state.user);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      // Clear test mode if it exists
      localStorage.removeItem('testMode');
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check for test mode and create mock user if needed
  const isTestMode = localStorage.getItem('testMode') === 'true';
  const currentUser = user || (isTestMode ? {
    uid: 'test-admin-uid',
    email: 'test@admin.com',
    displayName: 'Test Admin',
    role: 'admin' as const,
    createdAt: new Date()
  } : null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'buses':
        return <BusManagement />;
      case 'routes':
        return <RouteManagement />;
      case 'stock':
        return <StockManagement />;
      default:
        return <BusManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">ShadBus Admin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {currentUser.displayName}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('buses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'buses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                Bus Management
              </div>
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'routes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Map className="w-4 h-4 mr-2" />
                Route Management
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stock'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Stock Management
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 