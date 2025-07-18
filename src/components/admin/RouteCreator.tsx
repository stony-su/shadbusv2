import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import MapOL from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import { RoutePath } from '../../types';
import { Plus, Save, X, Trash2, RotateCcw } from 'lucide-react';

interface RouteCreatorProps {
  onSave: (routeData: {
    name: string;
    description: string;
    culturalFocus: string[];
    path: RoutePath[];
    color: string;
  }) => void;
  onCancel: () => void;
}

const CALGARY_CENTER = [-114.0719, 51.0447];

const RouteCreator: React.FC<RouteCreatorProps> = ({ onSave, onCancel }) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapOL | null>(null);
  const waypointSourceRef = useRef<VectorSource | null>(null);
  const routeLineSourceRef = useRef<VectorSource | null>(null);
  
  const [waypoints, setWaypoints] = useState<RoutePath[]>([]);
  const [routeName, setRouteName] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [routeColor, setRouteColor] = useState('#3b82f6');
  const [culturalFocus, setCulturalFocus] = useState<string[]>([]);

  const culturalOptions = [
    'Asian', 'Mediterranean', 'Middle Eastern', 'Indian', 'Mexican', 'Italian',
    'Local', 'Organic', 'Artisan', 'African', 'Caribbean', 'European'
  ];

  // Initialize map
  useEffect(() => {
    if (!mapElement.current) return;

    // Waypoint source for placing dots
    const waypointSource = new VectorSource({});
    waypointSourceRef.current = waypointSource;

    // Route line source for connecting waypoints
    const routeLineSource = new VectorSource({});
    routeLineSourceRef.current = routeLineSource;

    // Waypoint layer
    const waypointLayer = new VectorLayer({
      source: waypointSource,
      style: (feature) => {
        const index = feature.get('index');
        return new Style({
          image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: '#3b82f6' }),
            stroke: new Stroke({ color: '#ffffff', width: 2 })
          }),
          text: new Text({
            text: (index + 1).toString(),
            fill: new Fill({ color: '#ffffff' }),
            font: 'bold 12px Arial'
          })
        });
      }
    });

    // Route line layer
    const routeLineLayer = new VectorLayer({
      source: routeLineSource,
      style: new Style({
        stroke: new Stroke({
          color: '#3b82f6',
          width: 3
        })
      })
    });

    // Map instance
    const map = new MapOL({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        routeLineLayer,
        waypointLayer
      ],
      view: new View({
        center: fromLonLat(CALGARY_CENTER),
        zoom: 13,
        minZoom: 10,
        maxZoom: 16
      })
    });
    mapRef.current = map;

    // Click handler for placing waypoints
    const clickHandler = (evt: any) => {
      const coordinate = evt.coordinate;
      const [longitude, latitude] = toLonLat(coordinate);
      
      const newWaypoint: RoutePath = {
        latitude,
        longitude
      };
      
      setWaypoints(prev => [...prev, newWaypoint]);
    };

    map.on('singleclick', clickHandler);

    return () => {
      map.un('singleclick', clickHandler);
      map.setTarget(undefined);
    };
  }, []);

  // Update waypoint markers when waypoints change
  useEffect(() => {
    const waypointSource = waypointSourceRef.current;
    if (!waypointSource) return;
    
    waypointSource.clear();
    waypoints.forEach((waypoint, index) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([waypoint.longitude, waypoint.latitude]))
      });
      feature.set('index', index);
      waypointSource.addFeature(feature);
    });
  }, [waypoints]);

  // Update route line when waypoints change
  useEffect(() => {
    const routeLineSource = routeLineSourceRef.current;
    if (!routeLineSource) return;
    
    routeLineSource.clear();
    if (waypoints.length >= 2) {
      // Create a loop by adding the first point at the end
      const coordinates = [
        ...waypoints.map(wp => fromLonLat([wp.longitude, wp.latitude])),
        fromLonLat([waypoints[0].longitude, waypoints[0].latitude]) // Close the loop
      ];
      
      const feature = new Feature({
        geometry: new LineString(coordinates)
      });
      routeLineSource.addFeature(feature);
    }
  }, [waypoints]);

  const handleRemoveWaypoint = (index: number) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
  };

  const handleSaveRoute = () => {
    if (waypoints.length < 3) {
      alert('Please place at least 3 waypoints to create a route.');
      return;
    }

    if (!routeName.trim()) {
      alert('Please enter a route name.');
      return;
    }

    // Create a loop by adding the first point at the end
    const path = [...waypoints, waypoints[0]];

    onSave({
      name: routeName,
      description: routeDescription,
      culturalFocus,
      path,
      color: routeColor
    });
  };

  const toggleCulturalFocus = (culture: string) => {
    setCulturalFocus(prev => 
      prev.includes(culture)
        ? prev.filter(c => c !== culture)
        : [...prev, culture]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Route</h2>
            <p className="text-gray-600">Click on the map to place waypoints for your route</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearWaypoints}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear all waypoints"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Map */}
          <div className="flex-1 relative">
            <div ref={mapElement} className="w-full h-full" />
            
            {/* Instructions overlay */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
              <p className="text-sm text-gray-700">
                <strong>Instructions:</strong><br />
                • Click on the map to place waypoints<br />
                • Route will automatically loop back to start<br />
                • Minimum 3 waypoints required
              </p>
            </div>

            {/* Waypoint counter */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
              <p className="text-sm font-medium text-gray-700">
                Waypoints: {waypoints.length}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 p-6 overflow-y-auto">
            {/* Route Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Name *
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter route name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter route description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route Color
                </label>
                <div className="flex items-center gap-2 mt-1 mb-2">
                  <input
                    type="color"
                    value={routeColor}
                    onChange={(e) => setRouteColor(e.target.value)}
                    className="w-16 h-12 border-2 border-blue-400 rounded-md cursor-pointer shadow focus:ring-2 focus:ring-blue-500"
                    aria-label="Pick route color"
                  />
                  <span className="text-sm text-gray-600 font-mono">{routeColor}</span>
                </div>
                <p className="text-xs text-gray-500">Choose a color to represent this route on the map.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cultural Focus
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {culturalOptions.map((culture) => (
                    <label key={culture} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={culturalFocus.includes(culture)}
                        onChange={() => toggleCulturalFocus(culture)}
                        className="mr-2"
                      />
                      <span className="text-sm">{culture}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Waypoints List */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Waypoints</h3>
              {waypoints.length === 0 ? (
                <p className="text-gray-500 text-sm">No waypoints placed yet. Click on the map to add waypoints.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {waypoints.map((waypoint, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div>
                        <span className="font-medium text-gray-900">Point {index + 1}</span>
                        <p className="text-xs text-gray-500">
                          {waypoint.latitude.toFixed(4)}, {waypoint.longitude.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveWaypoint(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove waypoint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="mt-6">
              <button
                onClick={handleSaveRoute}
                disabled={waypoints.length < 3 || !routeName.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Route
              </button>
              {waypoints.length < 3 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Need at least 3 waypoints to save
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCreator; 