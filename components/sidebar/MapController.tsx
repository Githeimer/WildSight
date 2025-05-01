"use client";

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

// Map controller component to handle map updates
const MapController = ({ center, zoom }: MapControllerProps) => {
  const map = useMap();
  
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom);
    }
  }, [center, map, zoom]);
  
  return null;
};

export default MapController;