"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Animal, MovementDataPoint, speciesColors } from '../utils/types';

// Fix for Leaflet icon issue in Next.js
const fixLeafletIcons = () => {
  // Only run on the client side
  if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
};

interface MovementMapProps {
  trackingData: {[animalId: number]: MovementDataPoint[]};
  selectedAnimalId: number | null;
  animals: Animal[];
  height?: string;
}

const MovementMap: React.FC<MovementMapProps> = ({
  trackingData,
  selectedAnimalId,
  animals,
  height = '500px'
}) => {
  // Initialize leaflet icons
  useEffect(() => {
    fixLeafletIcons();
  }, []);
  
  // Filter data based on selected animal
  const filteredData = selectedAnimalId 
    ? { [selectedAnimalId]: trackingData[selectedAnimalId] || [] }
    : trackingData;
  
  // Create marker icons for different animals
  const createAnimalIcon = (animal: Animal) => {
    const color = speciesColors[animal.species] || speciesColors.default;
    
    return new L.DivIcon({
      className: 'animal-marker-icon',
      html: `<div style="background-color: ${color}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
        <span>●</span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };
  
  // Compute bounding box to fit all points on the map
  const getBounds = () => {
    const allPoints: [number, number][] = [];
    
    Object.values(filteredData).forEach(points => {
      points.forEach(point => {
        if (point.lat !== 0 && point.lon !== 0) {
          allPoints.push([point.lat, point.lon]);
        }
      });
    });
    
    if (allPoints.length === 0) {
      // Default center if no points
      return L.latLngBounds([
        [27.619605, 85.537153],
        [27.619605, 85.537153]
      ]);
    }
    
    return L.latLngBounds(allPoints);
  };
  
  // Format date for display
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // If no data to display
  if (Object.keys(filteredData).length === 0 || 
      Object.values(filteredData).every(points => points.length === 0)) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No movement data available</p>
      </div>
    );
  }
  
  return (
    <div style={{ height }}>
      <MapContainer 
        bounds={getBounds()} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render movement paths for each animal */}
        {Object.entries(filteredData).map(([animalIdStr, points]) => {
          const animalId = parseInt(animalIdStr, 10);
          const animal = animals.find(a => a.id === animalId);
          if (!animal || points.length < 2) return null;
          
          const color = speciesColors[animal.species] || speciesColors.default;
          const positions = points.map(point => [point.lat, point.lon] as [number, number]);
          
          return (
            <React.Fragment key={animalId}>
              {/* Path line */}
              <Polyline 
                positions={positions}
                pathOptions={{ 
                  color: color, 
                  weight: 3, 
                  opacity: 0.7,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              
              {/* Start point */}
              <Marker 
                position={[points[0].lat, points[0].lon]} 
                icon={createAnimalIcon(animal)}
              >
                <Tooltip permanent>
                  <div>
                    <b>{animal.tag_id}</b> - Start
                    <div className="text-xs">{formatTimestamp(points[0].timestamp)}</div>
                  </div>
                </Tooltip>
              </Marker>
              
              {/* End point */}
              <Marker 
                position={[points[points.length - 1].lat, points[points.length - 1].lon]} 
                icon={createAnimalIcon(animal)}
              >
                <Tooltip permanent>
                  <div>
                    <b>{animal.tag_id}</b> - End
                    <div className="text-xs">{formatTimestamp(points[points.length - 1].timestamp)}</div>
                  </div>
                </Tooltip>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MovementMap;