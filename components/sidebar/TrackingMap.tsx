"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Animal, TrackingData, speciesColors, speciesIcons } from '@/utils/types';
import { getPolylinePoints } from '@/utils/dataProcessing';
import MapController from './MapController';

// Fix for Leaflet icon issue in Next.js
const fixLeafletIcons = () => {
  // Only run on the client side to prevent "window is not defined" errors
  if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
};

interface TrackingMapProps {
  animals: Animal[];
  selectedAnimals: number[];
  trackingData: {[deviceId: number]: TrackingData[]};
  showPaths: {[animalId: number]: boolean};
  mapCenter: [number, number];
  mapZoom: number;
  dataViewMode: 'temperature' | 'humidity';
  activeDeviceId: number | null;
  hasRealTrackingData: (animalId: number) => boolean;
  togglePath: (animalId: number) => void;
  setMapZoom: (zoom: number) => void;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  animals,
  selectedAnimals,
  trackingData,
  showPaths,
  mapCenter,
  mapZoom,
  dataViewMode,
  activeDeviceId,
  hasRealTrackingData,
  togglePath,
  setMapZoom
}) => {
  // Initialize leaflet icons
  useEffect(() => {
    fixLeafletIcons();
  }, []);
  
  // Create marker icons for different animals
  const createAnimalIcon = (animal: Animal, isActive: boolean) => {
    const species = animal.species || 'default';
    const color = speciesColors[species] || speciesColors.default;
    const icon = speciesIcons[species] || speciesIcons.default;
    
    return new L.DivIcon({
      className: 'animal-marker-icon',
      html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; font-size: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); ${isActive ? 'animation: pulse 1.5s infinite;' : ''}">${icon}</div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
            </style>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };
  
  // Get color for an animal
  const getAnimalColor = (animal: Animal) => {
    const species = animal.species || 'default';
    return speciesColors[species] || speciesColors.default;
  };
  
  // Get valid tracking points for an animal
  const getValidTrackingPoints = (animalId: number) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal || !animal.device_id) return [];
    
    const deviceData = trackingData[animal.device_id] || [];
    return deviceData.filter(point => point.lat !== 0 && point.lon !== 0);
  };
  
  // Filter only selected animals that have real tracking data or are actively connected
  const animalsToShow = selectedAnimals.filter(animalId => {
    const animal = animals.find(a => a.id === animalId);
    return animal && 
           (hasRealTrackingData(animalId) || 
            (animal.device_id && animal.device_id === activeDeviceId));
  });
  
  return (
    <div className="h-96 rounded overflow-hidden border">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          map.on('zoom', () => setMapZoom(map.getZoom()));
        }}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render animals on map */}
        {animalsToShow.map(animalId => {
          const animal = animals.find(a => a.id === animalId);
          if (!animal || !animal.device_id) return null;
          
          const trackingPoints = getValidTrackingPoints(animalId);
          if (trackingPoints.length === 0) return null;
          
          const isActive = animal.device_id === activeDeviceId;
          const polylinePoints = getPolylinePoints(trackingData[animal.device_id] || []);
          const showPath = showPaths[animalId] || false;
          const color = getAnimalColor(animal);
          
          // Get the latest point
          const latestPoint = trackingPoints[0];
          
          return (
            <React.Fragment key={animalId}>
              {/* Path line if enabled */}
              {showPath && polylinePoints.length > 1 && (
                <Polyline 
                  positions={polylinePoints}
                  pathOptions={{ 
                    color: color, 
                    weight: 4, 
                    opacity: 0.7,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />
              )}
              
              {/* Data visualization circle - only current location */}
              <Circle
                center={[latestPoint.lat, latestPoint.lon]}
                radius={dataViewMode === 'temperature' 
                  ? latestPoint.temperature * 10
                  : latestPoint.humidity * 5
                }
                pathOptions={{ 
                  fillColor: color, 
                  fillOpacity: 0.2,
                  weight: 1,
                  color: color
                }}
              />
              
              {/* Current location marker */}
              <Marker 
                position={[latestPoint.lat, latestPoint.lon]} 
                icon={createAnimalIcon(animal, isActive)}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold text-lg mb-1">
                      {animal.tag_id}
                      {isActive && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Live
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 mb-2">{animal.species} ({animal.sex})</p>
                    
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">Time:</span> {new Date(latestPoint.timestamp).toLocaleTimeString()}</p>
                      <p><span className="font-medium">Date:</span> {new Date(latestPoint.timestamp).toLocaleDateString()}</p>
                      <p><span className="font-medium">Temperature:</span> {latestPoint.temperature.toFixed(1)}°C</p>
                      <p><span className="font-medium">Humidity:</span> {latestPoint.humidity.toFixed(1)}%</p>
                      <p><span className="font-medium">Location:</span> {latestPoint.lat.toFixed(6)}, {latestPoint.lon.toFixed(6)}</p>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <button
                        onClick={() => togglePath(animalId)}
                        className="w-full px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        {showPath ? 'Hide Path' : 'Show Path'}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
              
              {/* Historical points if path enabled */}
              {showPath && trackingPoints.slice(1).map((point, index) => (
                <Marker 
                  key={index}
                  position={[point.lat, point.lon]} 
                  icon={new L.DivIcon({
                    className: 'historical-marker',
                    html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; opacity: 0.6;"></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [5, 5]
                  })}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">{animal.tag_id} - Historical Point</p>
                      <p>{new Date(point.timestamp).toLocaleString()}</p>
                      <p>Temperature: {point.temperature.toFixed(1)}°C</p>
                      <p>Humidity: {point.humidity.toFixed(1)}%</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TrackingMap;