import React from 'react';
import { BusDetails } from '../types';
import { X, Truck, MapPin, Clock, Package, Users, Map, Globe } from 'lucide-react';

interface BusDetailsPanelProps {
  bus: BusDetails;
  onClose: () => void;
}

const BusDetailsPanel: React.FC<BusDetailsPanelProps> = ({ bus, onClose }) => {
  // Get cultural foods from inventory
  const culturalFoods = bus.inventory.items.filter(item => 
    item.category === 'cultural' || item.culturalOrigin
  );

  // Get stock status
  const inStockItems = bus.inventory.items.filter(item => item.inStock);
  const outOfStockItems = bus.inventory.items.filter(item => !item.inStock);

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">{bus.route.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          bus.status === 'active' ? 'bg-green-100 text-green-800' :
          bus.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
        </span>
      </div>

      {/* Driver Info */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
        <Users className="w-4 h-4 text-blue-600" />
        <div>
          <div className="text-sm font-medium text-gray-800">Driver</div>
          <div className="text-sm text-gray-600">{bus.driver}</div>
        </div>
      </div>

      {/* Location Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Current Location</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Coordinates:</span>
            <span className="font-mono text-xs">
              {bus.location.latitude.toFixed(4)}, {bus.location.longitude.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Speed:</span>
            <span>{bus.location.currentSpeed} km/h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Heading:</span>
            <span>{Math.round(bus.location.heading)}°</span>
          </div>
        </div>
      </div>

      {/* ETA */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-lg">
        <Clock className="w-4 h-4 text-orange-600" />
        <div>
          <div className="text-sm font-medium text-gray-800">Estimated Arrival</div>
          <div className="text-sm text-gray-600">{bus.location.estimatedArrival} minutes</div>
        </div>
      </div>

      {/* Route Information */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Map className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Route Details</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            {bus.route.description}
          </div>
          {bus.route.culturalFocus.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-700 mb-1">Cultural Focus:</div>
              <div className="flex flex-wrap gap-1">
                {bus.route.culturalFocus.map((focus, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    <Globe className="w-3 h-3 mr-1" />
                    {focus}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Inventory Summary</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Items:</span>
            <span className="font-medium">{bus.inventory.totalItems}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">In Stock:</span>
            <span className="text-green-600 font-medium">{inStockItems.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Out of Stock:</span>
            <span className="text-red-600 font-medium">{outOfStockItems.length}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(bus.inventory.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Cultural Foods */}
      {culturalFoods.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-800">Cultural Foods</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="space-y-2">
              {culturalFoods.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.culturalOrigin && (
                      <span className="text-xs bg-purple-200 text-purple-800 px-1 py-0.5 rounded">
                        {item.culturalOrigin}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-xs text-gray-500">
                      ${item.price}
                    </span>
                  </div>
                </div>
              ))}
              {culturalFoods.length > 5 && (
                <div className="text-xs text-gray-500 text-center pt-2 border-t border-purple-200">
                  +{culturalFoods.length - 5} more cultural items
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Last Update */}
      <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
        Last updated: {new Date(bus.lastUpdate).toLocaleString()}
      </div>
    </div>
  );
};

export default BusDetailsPanel; 