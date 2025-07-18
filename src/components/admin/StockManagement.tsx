import React, { useState, useEffect } from 'react';
import { busService, UpdateStockRequest } from '../../services/busService';
import { BusDetails, FoodItem } from '../../types';
import { Package, Plus, Edit, Trash2, ShoppingCart } from 'lucide-react';

const StockManagement: React.FC = () => {
  const [buses, setBuses] = useState<BusDetails[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state for adding new item
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'fruits' as FoodItem['category'],
    culturalOrigin: '',
    quantity: 0,
    unit: '',
    price: 0,
    inStock: true
  });

  const categoryOptions = [
    'fruits', 'vegetables', 'dairy', 'meat', 'grains', 'cultural'
  ];

  const unitOptions = [
    'kg', 'pieces', 'jars', 'containers', 'liters', 'packets', 'sets', 'bottles'
  ];

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const busesData = await busService.getAllBuses();
      setBuses(busesData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!selectedBus) return;

    try {
      setLoading(true);
      const item: FoodItem = {
        id: `item-${Date.now()}`,
        ...newItem
      };

      await busService.addItemToBus(selectedBus.id, item);
      setNewItem({
        name: '',
        category: 'fruits',
        culturalOrigin: '',
        quantity: 0,
        unit: '',
        price: 0,
        inStock: true
      });
      await loadBuses();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (busId: string, itemId: string, quantity: number, inStock: boolean) => {
    try {
      const request: UpdateStockRequest = {
        busId,
        items: [{
          id: itemId,
          quantity,
          inStock
        }]
      };

      await busService.updateBusStock(request);
      await loadBuses();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteItem = async (busId: string, itemId: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const bus = buses.find(b => b.id === busId);
      if (!bus) return;

      const updatedItems = bus.inventory.items.filter(item => item.id !== itemId);
      
      const request: UpdateStockRequest = {
        busId,
        items: updatedItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          inStock: item.inStock
        }))
      };

      await busService.updateBusStock(request);
      await loadBuses();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Stock Management</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Bus Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Bus</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buses.map((bus) => (
            <button
              key={bus.id}
              onClick={() => setSelectedBus(bus)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedBus?.id === bus.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{bus.route.name}</div>
              <div className="text-sm text-gray-500">Driver: {bus.driver}</div>
              <div className="text-sm text-gray-500">
                Items: {bus.inventory.totalItems}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedBus && (
        <>
          {/* Add New Item */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Item to {selectedBus.route.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as FoodItem['category'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cultural Origin
                </label>
                <input
                  type="text"
                  value={newItem.culturalOrigin}
                  onChange={(e) => setNewItem({ ...newItem, culturalOrigin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Korean, Greek"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={handleAddItem}
                disabled={!newItem.name || !newItem.unit || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Item
              </button>
            </div>
          </div>

          {/* Current Inventory */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Current Inventory - {selectedBus.route.name}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedBus.inventory.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.culturalOrigin || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateStock(selectedBus.id, item.id, parseInt(e.target.value), item.inStock)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-sm text-gray-500 ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={item.inStock ? 'in-stock' : 'out-of-stock'}
                          onChange={(e) => handleUpdateStock(selectedBus.id, item.id, item.quantity, e.target.value === 'in-stock')}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="in-stock">In Stock</option>
                          <option value="out-of-stock">Out of Stock</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteItem(selectedBus.id, item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockManagement; 