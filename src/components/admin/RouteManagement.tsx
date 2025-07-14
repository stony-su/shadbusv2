import React, { useState, useEffect } from 'react';
import { busService, CreateRouteRequest } from '../../services/busService';
import { BusRoute } from '../../types';
import { Plus, Map, Trash2, Edit, Save, X } from 'lucide-react';

const RouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    culturalFocus: [] as string[]
  });

  const culturalOptions = [
    'Asian', 'Mediterranean', 'Middle Eastern', 'Indian', 'Mexican', 'Italian',
    'Local', 'Organic', 'Artisan', 'African', 'Caribbean', 'European'
  ];

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const routesData = await busService.getAllRoutes();
      setRoutes(routesData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const request: CreateRouteRequest = {
        name: formData.name,
        description: formData.description,
        culturalFocus: formData.culturalFocus
      };

      await busService.createRoute(request);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        culturalFocus: []
      });
      await loadRoutes();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute) return;

    setLoading(true);
    setError('');

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        culturalFocus: formData.culturalFocus
      };

      await busService.updateRoute(editingRoute.id, updates);
      setEditingRoute(null);
      setFormData({
        name: '',
        description: '',
        culturalFocus: []
      });
      await loadRoutes();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (route: BusRoute) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      description: route.description,
      culturalFocus: route.culturalFocus
    });
  };

  const cancelEditing = () => {
    setEditingRoute(null);
    setFormData({
      name: '',
      description: '',
      culturalFocus: []
    });
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await busService.deleteRoute(routeId);
      await loadRoutes();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const toggleCulturalFocus = (culture: string) => {
    setFormData({
      ...formData,
      culturalFocus: formData.culturalFocus.includes(culture)
        ? formData.culturalFocus.filter(c => c !== culture)
        : [...formData.culturalFocus, culture]
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading routes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Management</h1>
          <p className="text-gray-600">Manage bus routes and their cultural focus</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Route
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Routes List */}
      <div className="grid gap-4">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Map className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                </div>
                <p className="text-gray-600 mb-3">{route.description}</p>
                
                {/* Cultural Focus */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {route.culturalFocus.map((culture, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {culture}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEditing(route)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Route"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoute(route.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Route"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Route Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Route</h3>
          <form onSubmit={handleCreateRoute} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter route name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter route description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Focus
              </label>
              <div className="grid grid-cols-3 gap-2">
                {culturalOptions.map((culture) => (
                  <label key={culture} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.culturalFocus.includes(culture)}
                      onChange={() => toggleCulturalFocus(culture)}
                      className="mr-2"
                    />
                    <span className="text-sm">{culture}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Route'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Route Form */}
      {editingRoute && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Edit Route: {editingRoute.name}</h3>
            <button
              onClick={cancelEditing}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleEditRoute} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Focus
              </label>
              <div className="grid grid-cols-3 gap-2">
                {culturalOptions.map((culture) => (
                  <label key={culture} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.culturalFocus.includes(culture)}
                      onChange={() => toggleCulturalFocus(culture)}
                      className="mr-2"
                    />
                    <span className="text-sm">{culture}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RouteManagement; 