import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { busService } from '../../services/busService';
import { LogOut, Settings, Truck, Map, Package, Users, Database } from 'lucide-react';
import BusManagement from './BusManagement';
import RouteManagement from './RouteManagement';
import StockManagement from './StockManagement';

type DashboardTab = 'buses' | 'routes' | 'stock' | 'utilities';

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
    } catch (_error: unknown) {
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
      case 'utilities':
        return <UtilitiesTab />;
      default:
        return <BusManagement />;
    }
  };

  const UtilitiesTab: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleRemoveDuplicates = async () => {
      if (!window.confirm('Are you sure you want to remove duplicate routes? This action cannot be undone.')) {
        return;
      }

      setLoading(true);
      setMessage('');
      
      try {
        await busService.removeDuplicateRoutes();
        setMessage('Duplicate routes removed successfully!');
      } catch (error: any) {
        setMessage(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleWipeAllData = async () => {
      if (!window.confirm('Are you sure you want to wipe ALL data? This action cannot be undone.')) {
        return;
      }

      setLoading(true);
      setMessage('');
      
      try {
        await busService.wipeAllData();
        setMessage('All data wiped successfully!');
      } catch (error: any) {
        setMessage(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Database Utilities</h2>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('Error') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Remove Duplicate Routes</h4>
                <p className="text-sm text-gray-600">Clean up duplicate routes in the database</p>
              </div>
              <button
                onClick={handleRemoveDuplicates}
                disabled={loading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Remove Duplicates'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Wipe All Data</h4>
                <p className="text-sm text-gray-600">Delete all buses, routes, and stock data</p>
              </div>
              <button
                onClick={handleWipeAllData}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Wipe All Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
            <button
              onClick={() => setActiveTab('utilities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'utilities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Utilities
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