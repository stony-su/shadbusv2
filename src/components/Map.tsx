import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import MapOL from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { BusDetails } from '../types';
import { busService } from '../services/busService';
import BusDetailsPanel from './BusDetailsPanel';
import BusTracker from './BusTracker';

interface MapProps {
  className?: string;
}

const CALGARY_CENTER = [ -114.0719, 51.0447 ];

const Map: React.FC<MapProps> = ({ className = '' }) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapOL | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const [buses, setBuses] = useState<BusDetails[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusDetails | null>(null);

  useEffect(() => {
    if (!mapElement.current) return;

    // Vector source for bus markers
    const vectorSource = new VectorSource({});
    vectorSourceRef.current = vectorSource;

    // Vector layer for buses
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const isSelected = feature.get('isSelected');
        const busStatus = feature.get('busStatus');
        
        // Determine color based on status only
        let fillColor = '#3b82f6'; // default blue for active
        if (busStatus === 'maintenance') {
          fillColor = '#f59e0b'; // yellow for maintenance
        } else if (busStatus === 'offline') {
          fillColor = '#ef4444'; // red for offline
        } else if (busStatus === 'active') {
          fillColor = '#10b981'; // green for active
        }
        
        // If selected, use a darker version of the status color
        if (isSelected) {
          if (busStatus === 'maintenance') {
            fillColor = '#d97706'; // darker yellow
          } else if (busStatus === 'offline') {
            fillColor = '#dc2626'; // darker red
          } else {
            fillColor = '#059669'; // darker green
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

    // Map instance
    const map = new MapOL({
      target: mapElement.current,
      layers: [
        new TileLayer({ source: new OSM() }),
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
  }, [buses]); // Include buses in dependency array

  // Update bus markers when buses or selection changes
  useEffect(() => {
    const vectorSource = vectorSourceRef.current;
    if (!vectorSource) return;
    vectorSource.clear();
    buses.forEach((bus) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([bus.location.longitude, bus.location.latitude]))
      });
      feature.set('busId', bus.id);
      feature.set('busStatus', bus.status);
      feature.set('isSelected', selectedBus?.id === bus.id);
      feature.set('heading', bus.location.heading);
      vectorSource.addFeature(feature);
    });
  }, [buses, selectedBus]);

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