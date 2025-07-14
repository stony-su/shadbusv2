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
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { BusDetails, BusRoute } from '../types';
import { busService } from '../services/busService';
import BusDetailsPanel from './BusDetailsPanel';
import BusTracker from './BusTracker';

interface MapProps {
  className?: string;
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

const Map: React.FC<MapProps> = ({ className = '' }) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapOL | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const routeSourceRef = useRef<VectorSource | null>(null);
  const [buses, setBuses] = useState<BusDetails[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusDetails | null>(null);
  const [busMovementState, setBusMovementState] = useState<BusMovementState>({});
  const animationRef = useRef<number>();

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
        
        newMovementState[bus.id] = {
          currentPathIndex: 0,
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

  useEffect(() => {
    if (!mapElement.current) return;

    // Vector source for bus markers
    const vectorSource = new VectorSource({});
    vectorSourceRef.current = vectorSource;

    // Vector source for route polylines
    const routeSource = new VectorSource({});
    routeSourceRef.current = routeSource;

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
        vectorLayer
      ],
      view: new View({
        center: fromLonLat(CALGARY_CENTER),
        zoom: 13,
        minZoom: 10,
        maxZoom: 16
      })
    });
    mapRef.current = map;

    // Click handler for selecting bus
    const clickHandler = (evt: any) => {
      let found = false;
      map.forEachFeatureAtPixel(evt.pixel, (feature) => {
        const busId = feature.get('busId');
        if (busId) {
          const bus = buses.find(b => b.id === busId);
          if (bus) {
            setSelectedBus(bus);
            found = true;
          }
        }
      });
      if (!found) {
        setSelectedBus(null);
      }
    };

    map.on('singleclick', clickHandler);

    return () => {
      map.un('singleclick', clickHandler);
      map.setTarget(undefined);
    };
  }, [buses, routes]);

  // Update bus markers when buses or selection changes
  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return;
    vectorSource.clear();
    buses.forEach((bus) => {
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
  }, [buses, selectedBus, busMovementState]);

  // Update route polylines when routes change
  useEffect(() => {
    const routeSource = routeSourceRef.current;
    if (!routeSource) return;
    
    console.log('Updating route polylines with routes:', routes);
    routeSource.clear();
    
    routes.forEach((route) => {
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
  }, [routes]);

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
    <div className={`relative ${className}`}>
      {/* Map container */}
      <div ref={mapElement} className="h-screen w-full" style={{ height: '100vh' }} />

      {/* Header */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">ShadBus Tracker</h1>
        <p className="text-gray-600 text-sm">Calgary Mobile Grocery Bus Tracker</p>
        <div className="mt-2 text-sm text-gray-500">
          Active Buses: {buses.filter(bus => bus.status === 'active').length}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-[1000] mt-48 bg-white rounded-lg shadow-lg p-2">
        <div className="flex flex-col gap-1">
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

      {/* Bus Tracker for real-time updates */}
      <BusTracker buses={buses} />
    </div>
  );
};

export default Map; 