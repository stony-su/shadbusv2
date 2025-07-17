import React from 'react';
import { Hub, FoodItem as _FoodItem } from '../types';
import { X, MapPin, Clock, Package, Store } from 'lucide-react';

interface HubDetailsPanelProps {
  hub: Hub;
  onClose: () => void;
}

const HubDetailsPanel: React.FC<HubDetailsPanelProps> = ({ hub, onClose }) => {
  const inStockItems = hub.stock.filter(item => item.inStock);
  const outOfStockItems = hub.stock.filter(item => !item.inStock);

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-pink-600" />
          <h2 className="text-xl font-bold text-gray-800">{hub.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Location Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Location</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Coordinates:</span>
            <span className="font-mono text-xs">
              {hub.location.latitude.toFixed(4)}, {hub.location.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Open/Close Times */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
        <Clock className="w-4 h-4 text-blue-600" />
        <div>
          <div className="text-sm font-medium text-gray-800">Open Hours</div>
          <div className="text-sm text-gray-600">{hub.openTime} - {hub.closeTime}</div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Stock Summary</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Items:</span>
            <span className="font-medium">{hub.stock.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">In Stock:</span>
            <span className="text-green-600 font-medium">{inStockItems.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Out of Stock:</span>
            <span className="text-red-600 font-medium">{outOfStockItems.length}</span>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-800">Stock Details</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 font-bold">Item</th>
                <th className="px-2 py-1 font-bold">Category</th>
                <th className="px-2 py-1 font-bold">Quantity</th>
                <th className="px-2 py-1 font-bold">Price</th>
                <th className="px-2 py-1 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {hub.stock.map(item => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="px-2 py-1">{item.name}</td>
                  <td className="px-2 py-1">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                  <td className="px-2 py-1 break-all">{item.quantity} {item.unit}</td>
                  <td className="px-2 py-1 whitespace-nowrap">${item.price.toFixed(2)}</td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs ${item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HubDetailsPanel; 