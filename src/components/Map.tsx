import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import MapOL from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke, RegularShape } from 'ol/style';
import { BusDetails, BusRoute, Hub } from '../types';
import { busService } from '../services/busService';
import BusDetailsPanel from './BusDetailsPanel';
import BusTracker from './BusTracker';
import { mockHubs } from '../services/mockData';
import HubDetailsPanel from './HubDetailsPanel';

// For triple-click admin access
declare global {
  interface Window {
    __shadbusClickTimes?: number[];
  }
}

interface MapProps {
  className?: string;
  onTripleClick?: () => void;
}

const CALGARY_CENTER = [ -114.0719, 51.0447 ];

// Bus movement state
interface BusMovementState {
  [busId: string]: {
    currentPathIndex: number;
    progress: number; // 0 to 1 between path points
    lastUpdate: number;
    speed: number; // Individual speed for each bus
  };
}

const culturalOptions = [
  'All',
  'Asian', 'Mediterranean', 'Middle Eastern', 'Indian', 'Mexican', 'Italian',
  'Local', 'Organic', 'Artisan', 'African', 'Caribbean', 'European'
];

// Color mappings for categories and cultures
const categoryColors: Record<string, string> = {
  fruits: 'bg-yellow-100 text-yellow-800',
  vegetables: 'bg-green-100 text-green-800',
  dairy: 'bg-blue-100 text-blue-800',
  meat: 'bg-red-100 text-red-800',
  grains: 'bg-orange-100 text-orange-800',
  cultural: 'bg-purple-100 text-purple-800',
};

const cultureColors: Record<string, string> = {
  Korean: 'bg-pink-100 text-pink-800',
  Chinese: 'bg-red-100 text-red-800',
  Vietnamese: 'bg-green-100 text-green-800',
  Greek: 'bg-blue-100 text-blue-800',
  Lebanese: 'bg-yellow-100 text-yellow-800',
  Egyptian: 'bg-orange-100 text-orange-800',
  Indian: 'bg-purple-100 text-purple-800',
  Mexican: 'bg-lime-100 text-lime-800',
  Italian: 'bg-rose-100 text-rose-800',
  Local: 'bg-gray-100 text-gray-800',
  Organic: 'bg-green-50 text-green-700',
  Artisan: 'bg-indigo-100 text-indigo-800',
  African: 'bg-yellow-200 text-yellow-900',
  Caribbean: 'bg-cyan-100 text-cyan-800',
  European: 'bg-blue-50 text-blue-700',
  Mediterranean: 'bg-teal-100 text-teal-800',
  'Middle Eastern': 'bg-amber-100 text-amber-800',
};

const Map: React.FC<MapProps> = ({ className = '', onTripleClick }) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapOL | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const routeSourceRef = useRef<VectorSource | null>(null);
  const [buses, setBuses] = useState<BusDetails[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusDetails | null>(null);
  const [busMovementState, setBusMovementState] = useState<BusMovementState>({});
  const animationRef = useRef<number>();
  const [selectedCulture, setSelectedCulture] = useState<string>('All');
  const [winterMode, setWinterMode] = useState(false);
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  // Load routes once
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        console.log('Loading routes...');
        const routesData = await busService.getAllRoutes();
        console.log('Routes loaded:', routesData);
        setRoutes(routesData);
      } catch (error) {
        console.error('Error loading routes:', error);
      }
    };
    loadRoutes();
  }, []);

  // Initialize bus movement state when buses change
  useEffect(() => {
    const newMovementState: BusMovementState = {};
    buses.forEach((bus, index) => {
      if (!busMovementState[bus.id]) {
        // Set different speeds for different buses
        let speed = 0.0001; // Default speed
        // Vary speeds based on bus index or status
        if (index === 0) {
          speed = 0.00015; // Fast bus
        } else if (index === 1) {
          speed = 0.00008; // Slow bus
        } else if (bus.status === 'maintenance') {
          speed = 0.00005; // Very slow for maintenance buses
        } else if (bus.status === 'offline') {
          speed = 0; // No movement for offline buses
        } else {
          speed = 0.00001 + (Math.random() * 0.0003); // Random speed for others
        }
        // Randomize spawn at a waypoint on the route
        let currentPathIndex = 0;
        const route = routes.find(r => r.id === bus.route.id);
        if (route && route.path && route.path.length > 1) {
          currentPathIndex = Math.floor(Math.random() * (route.path.length - 1));
        }
        newMovementState[bus.id] = {
          currentPathIndex,
          progress: 0,
          lastUpdate: Date.now(),
          speed
        };
      } else {
        newMovementState[bus.id] = busMovementState[bus.id];
      }
    });
    setBusMovementState(newMovementState);
  }, [buses]);

  // Animate bus movement along routes
  useEffect(() => {
    const animateBuses = () => {
      const now = Date.now();
      
      setBusMovementState(prevState => {
        const newState = { ...prevState };
        let hasChanges = false;
        
        buses.forEach(bus => {
          const route = routes.find(r => r.id === bus.route.id);
          if (!route || !route.path || route.path.length < 2) return;
          
          const movement = newState[bus.id];
          if (!movement) return;
          
          // Skip movement for offline buses
          if (movement.speed === 0) return;
          
          const timeDiff = now - movement.lastUpdate;
          const progressIncrement = movement.speed * timeDiff;
          
          movement.progress += progressIncrement;
          movement.lastUpdate = now;
          
          // Move to next path segment if needed
          if (movement.progress >= 1) {
            movement.progress = 0;
            movement.currentPathIndex = (movement.currentPathIndex + 1) % (route.path.length - 1);
          }
          
          hasChanges = true;
        });
        
        return hasChanges ? newState : prevState;
      });
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animateBuses);
    };

    if (buses.length > 0 && routes.length > 0) {
      animationRef.current = requestAnimationFrame(animateBuses);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [buses, routes]);

  // Calculate bus position along route
  const getBusPosition = (bus: BusDetails) => {
    const route = routes.find(r => r.id === bus.route.id);
    if (!route || !route.path || route.path.length < 2) {
      return { latitude: bus.location.latitude, longitude: bus.location.longitude };
    }
    
    const movement = busMovementState[bus.id];
    if (!movement) {
      return { latitude: bus.location.latitude, longitude: bus.location.longitude };
    }
    
    const pathIndex = movement.currentPathIndex;
    const progress = movement.progress;
    
    if (pathIndex >= route.path.length - 1) {
      return route.path[0];
    }
    
    const currentPoint = route.path[pathIndex];
    const nextPoint = route.path[pathIndex + 1];
    
    // Interpolate between current and next point
    const latitude = currentPoint.latitude + (nextPoint.latitude - currentPoint.latitude) * progress;
    const longitude = currentPoint.longitude + (nextPoint.longitude - currentPoint.longitude) * progress;
    
    return { latitude, longitude };
  };

  // Filter routes and buses by selected culture
  const filteredRoutes = selectedCulture === 'All'
    ? routes
    : routes.filter(route => route.culturalFocus.includes(selectedCulture));
  const filteredBuses = selectedCulture === 'All'
    ? buses
    : buses.filter(bus => bus.route.culturalFocus.includes(selectedCulture));

  // Conveyor belt scroll logic for each bus
  const scrollRefs = useRef<{ [busId: string]: HTMLDivElement | null }>({});
  useEffect(() => {
    const intervalIds: { [busId: string]: unknown } = {};
    filteredBuses.forEach((bus) => {
      const ref = scrollRefs.current[bus.id];
      if (ref) {
        let scroll = 0;
        let direction = 1;
        intervalIds[bus.id] = setInterval(() => {
          if (!ref) return;
          // Scroll up and down between 0 and maxScroll
          const maxScroll = ref.scrollHeight - ref.clientHeight;
          if (maxScroll <= 0) return;
          scroll += direction;
          if (scroll >= maxScroll) direction = -1;
          if (scroll <= 0) direction = 1;
          ref.scrollTop = scroll;
        }, 40); // Slow scroll
      }
    });
    return () => {
      Object.values(intervalIds).forEach(clearInterval);
    };
  }, [filteredBuses]);

  useEffect(() => {
    if (!mapElement.current) return;

    // Vector source for bus markers
    const vectorSource = new VectorSource({});
    vectorSourceRef.current = vectorSource;

    // Vector source for route polylines
    const routeSource = new VectorSource({});
    routeSourceRef.current = routeSource;

    // Vector source for hub markers (only in winter mode)
    let hubSource: VectorSource | null = null;
    let hubLayer: VectorLayer | null = null;
    if (winterMode) {
      hubSource = new VectorSource({});
      // Distinct style for hubs: large pink square
      hubLayer = new VectorLayer({
        source: hubSource,
        style: (_feature) => new Style({
          image: new RegularShape({
            points: 4,
            radius: 18, // bigger size
            angle: Math.PI / 4, // rotate to make it a square
            fill: new Fill({ color: '#ec4899' }),
            stroke: new Stroke({ color: '#fff', width: 4 })
          })
        }),
        zIndex: 10
      });
    }

    // Vector layer for buses
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const isSelected = feature.get('isSelected');
        const busStatus = feature.get('busStatus');
        let fillColor = '#3b82f6';
        if (busStatus === 'maintenance') {
          fillColor = '#f59e0b';
        } else if (busStatus === 'offline') {
          fillColor = '#ef4444';
        } else if (busStatus === 'active') {
          fillColor = '#10b981';
        }
        if (isSelected) {
          if (busStatus === 'maintenance') {
            fillColor = '#d97706';
          } else if (busStatus === 'offline') {
            fillColor = '#dc2626';
          } else {
            fillColor = '#059669';
          }
        }
        return new Style({
          image: new CircleStyle({
            radius: 10,
            fill: new Fill({ color: fillColor }),
            stroke: new Stroke({ color: '#fff', width: 2 })
          })
        });
      }
    });

    // Vector layer for routes
    const routeLayer = new VectorLayer({
      source: routeSource,
      zIndex: 1, // Ensure routes are above the base map
      style: (feature) => {
        const color = feature.get('color') || '#3b82f6';
        console.log('Styling route feature with color:', color);
        return new Style({
          stroke: new Stroke({
            color: '#ffffff', // White background stroke
            width: 8
          })
        });
      }
    });

    // Vector layer for routes (main stroke)
    const routeLayerMain = new VectorLayer({
      source: routeSource,
      zIndex: 2, // Above the background stroke
      style: (feature) => {
        const color = feature.get('color') || '#3b82f6';
        return new Style({
          stroke: new Stroke({
            color,
            width: 5
          })
        });
      }
    });

    // Map instance
    const map = new MapOL({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        routeLayer,
        routeLayerMain,
        vectorLayer,
        ...(hubLayer ? [hubLayer] : [])
      ],
      view: new View({
        center: fromLonLat(CALGARY_CENTER),
        zoom: 13,
        minZoom: 10,
        maxZoom: 16
      })
    });
    mapRef.current = map;

    // Click handler for selecting bus or hub
    const clickHandler = (evt: unknown) => {
      let found = false;
      map.forEachFeatureAtPixel(evt as any, (feature) => {
        const busId = feature.get('busId');
        if (busId) {
          const bus = buses.find(b => b.id === busId);
          if (bus) {
            setSelectedBus(bus);
            setSelectedHub(null);
            found = true;
          }
        }
        const hubId = feature.get('hubId');
        if (hubId) {
          const hub = mockHubs.find(h => h.id === hubId);
          if (hub) {
            setSelectedHub(hub);
            setSelectedBus(null);
            found = true;
          }
        }
      });
      if (!found) {
        setSelectedBus(null);
        setSelectedHub(null);
      }
    };

    map.on('singleclick', clickHandler);

    return () => {
      map.un('singleclick', clickHandler);
      map.setTarget(undefined);
    };
  }, [buses, routes, winterMode]);

  // Update bus and hub markers when data or selection changes
  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return;
    vectorSource.clear();
    filteredBuses.forEach((bus) => {
      const position = getBusPosition(bus);
      const feature = new Feature({
        geometry: new Point(fromLonLat([position.longitude, position.latitude]))
      });
      feature.set('busId', bus.id);
      feature.set('busStatus', bus.status);
      feature.set('isSelected', selectedBus?.id === bus.id);
      feature.set('heading', bus.location.heading);
      vectorSource.addFeature(feature);
    });
    // Add hub markers if winterMode
    if (winterMode && mapRef.current) {
      const map = mapRef.current;
      const hubLayer = map.getLayers().getArray().find(l => l instanceof VectorLayer && l.getZIndex() === 10) as VectorLayer | undefined;
      if (hubLayer) {
        const hubSource = hubLayer.getSource() as VectorSource;
        hubSource.clear();
        mockHubs.forEach(hub => {
          const feature = new Feature({
            geometry: new Point(fromLonLat([hub.location.longitude, hub.location.latitude]))
          });
          feature.set('hubId', hub.id);
          hubSource.addFeature(feature);
        });
      }
    }
  }, [filteredBuses, selectedBus, busMovementState, winterMode]);

  // Update route polylines when routes change or winterMode changes
  useEffect(() => {
    const routeSource = routeSourceRef.current;
    if (!routeSource) return;
    
    console.log('Updating route polylines with routes:', routes);
    routeSource.clear();
    
    filteredRoutes.forEach((route) => {
      console.log('Processing route:', route.name, 'with path:', route.path);
      if (route.path && route.path.length > 1) {
        const coords = route.path.map(p => fromLonLat([p.longitude, p.latitude]));
        console.log('Route coordinates:', coords);
        const feature = new Feature({
          geometry: new LineString(coords)
        });
        feature.set('color', route.color || '#3b82f6');
        routeSource.addFeature(feature);
        console.log('Added route feature to source');
      } else {
        console.log('Route has no valid path:', route);
      }
    });
    
    console.log('Route source features count:', routeSource.getFeatures().length);
  }, [filteredRoutes, winterMode]);

  // Subscribe to real-time bus updates
  useEffect(() => {
    const unsubscribe = busService.subscribeToBuses((updatedBuses) => {
      setBuses(updatedBuses);
    });
    return unsubscribe;
  }, []);

  const handleClosePanel = () => {
    setSelectedBus(null);
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined && zoom < 16) {
        view.animate({
          zoom: zoom + 1,
          duration: 250
        });
      }
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined && zoom > 10) {
        view.animate({
          zoom: zoom - 1,
          duration: 250
        });
      }
    }
  };

  return (
    <div className={`relative ${className} ${winterMode ? 'winter' : ''}`}>
      {/* Snowflake animation overlay */}
      {winterMode && (
        <div className="pointer-events-none fixed inset-0 z-[2000] snowflakes">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="snowflake">❄</div>
          ))}
        </div>
      )}
      {/* Blue tint overlay for winter mode */}
      {winterMode && (
        <div className="pointer-events-none absolute inset-0 z-[900] bg-blue-200/40 mix-blend-multiply" />
      )}
      {/* Map container */}
      <div ref={mapElement} className="h-screen w-full" style={{ height: '100vh' }} />
      {/* Winter Mode Switch - Top Right */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-row items-center gap-2 bg-white/80 rounded-lg shadow-lg px-4 py-2">
        <label htmlFor="winter-mode-toggle" className="font-semibold text-blue-700 select-none">Winter Mode</label>
        <input
          id="winter-mode-toggle"
          type="checkbox"
          checked={winterMode}
          onChange={e => setWinterMode(e.target.checked)}
          className="w-6 h-6 accent-blue-500 cursor-pointer"
        />
      </div>
      {/* Header + Zoom Controls Row */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-row items-start gap-4">
        {/* ShadBus Tracker Box */}
        <div className="bg-white rounded-lg shadow-lg p-4 min-w-[320px]">
          <h1
            className="text-2xl font-bold text-gray-800 mb-2 cursor-pointer select-none"
            onClick={() => {
              const win = window as Window;
              if (!win.__shadbusClickTimes) win.__shadbusClickTimes = [];
              const now = Date.now();
              win.__shadbusClickTimes = win.__shadbusClickTimes.filter((t: number) => now - t < 1000);
              win.__shadbusClickTimes.push(now);
              if (win.__shadbusClickTimes.length >= 3) {
                win.__shadbusClickTimes = [];
                if (typeof onTripleClick === 'function') onTripleClick();
              }
            }}
          >
            Right Next Door
          </h1>
          <p className="text-gray-600 text-sm">Calgary Mobile Grocery Bus Tracker</p>
          <div className="mt-2 text-sm text-gray-500">
            Active Buses: {filteredBuses.filter(bus => bus.status === 'active').length}
          </div>
          {/* Culture Filter Dropdown */}
          <div className="mt-3">
            <label htmlFor="culture-filter" className="block text-xs font-medium text-gray-700 mb-1">Filter by Culture</label>
            <select
              id="culture-filter"
              value={selectedCulture}
              onChange={e => setSelectedCulture(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {culturalOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {/* Stock Summaries */}
          <div className="mt-4 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: '480px' }}>
            {filteredBuses.map(bus => (
              <div key={bus.id} className="bg-gray-50 rounded-lg shadow-inner p-2 border border-gray-200 mb-2 min-h-[150px]">
                <div className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: bus.route.color }}></span>
                  {bus.route.name} <span className="text-xs text-gray-400">({bus.driver})</span>
                </div>
                <div
                  ref={el => (scrollRefs.current[bus.id] = el)}
                  className="overflow-hidden h-32 transition-all duration-300 overflow-x-auto"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <table className="min-w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 font-bold">Item</th>
                        <th className="px-2 py-1 font-bold">Category</th>
                        <th className="px-2 py-1 font-bold">Origin</th>
                        <th className="px-2 py-1 font-bold">Quantity</th>
                        <th className="px-2 py-1 font-bold">Price</th>
                        <th className="px-2 py-1 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bus.inventory.items.slice(0, 20).map(item => (
                        <tr key={item.id} className="border-b last:border-b-0">
                          <td className="px-2 py-1">{item.name}</td>
                          <td className="px-2 py-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] || 'bg-gray-100 text-gray-800'}`}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                          </td>
                          <td className="px-2 py-1">
                            {item.culturalOrigin ? (
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cultureColors[item.culturalOrigin] || 'bg-gray-100 text-gray-800'}`}>{item.culturalOrigin}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-2 py-1 break-all">{item.quantity}</td>
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
            ))}
          </div>
        </div>
        {/* Zoom Controls */}
        <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-1 h-fit mt-2">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>
      </div>
      {/* Bus Details Panel */}
      {selectedBus && (
        <BusDetailsPanel
          bus={selectedBus}
          onClose={handleClosePanel}
        />
      )}
      {selectedHub && (
        <HubDetailsPanel
          hub={selectedHub}
          onClose={() => setSelectedHub(null)}
        />
      )}
      {/* Bus Tracker for real-time updates */}
      <BusTracker buses={filteredBuses} />
    </div>
  );
};

export default Map;