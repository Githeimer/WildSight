"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet icon issue in Next.js
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

// Map controller component to handle map updates
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

// Custom marker icons
const createCustomIcon = (color: string, size: number) => {
  // Use specific colored markers for better visibility
  return new L.Icon({
    iconUrl: `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [size, size * 1.6],
    iconAnchor: [size/2, size * 1.6],
    popupAnchor: [1, -size],
    shadowSize: [size * 1.6, size * 1.6]
  });
};

// Create icon for current location with blue color and larger size
const currentLocationIcon = createCustomIcon('blue', 30);

// TypeScript interfaces
interface DeviceData {
  id: string;
  timestamp: string;
  temperature: number | string;
  humidity: number | string;
  lat: number | null;
  lon: number | null;
}

// WebSocket URL
const ESP32_WS_URL = 'ws://192.168.77.15';

const ESP32TrackingMap: React.FC = () => {
  // Initialize leaflet icons
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  // State
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [latestData, setLatestData] = useState<DeviceData | null>(null);
  const [connectionState, setConnectionState] = useState({
    status: 'Not connected',
    lastReceived: null as string | null,
    error: null as string | null,
    isConnected: false
  });
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.619605, 85.537153]);
  const [mapZoom, setMapZoom] = useState(17); // Higher zoom for better visibility
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [showPath, setShowPath] = useState<boolean>(false);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);

  // Parse ESP32 message
  const parseESP32Message = (message: string): DeviceData | null => {
    try {
      // For timestamp and ID
      let timestamp = new Date().toISOString();
      let id = 'unknown';
      let lat: number | null = null;
      let lon: number | null = null;
      let temperature: number | string = 'Error';
      let humidity: number | string = 'Error';
      
      // Parse timestamp and ID from format: [4/30/2025, 7:55:05 AM] ID: 001°C
      const timestampMatch = message.match(/\[(.*?)\]/);
      if (timestampMatch) {
        timestamp = new Date(timestampMatch[1].trim()).toISOString();
      }
      
      const idMatch = message.match(/ID:\s*([^\s°C]+)/);
      if (idMatch) {
        id = idMatch[1].trim();
      }
      
      // Parse lat/lon
      const latMatch = message.match(/Latitude:\s*([0-9.-]+)/);
      const lonMatch = message.match(/Longitude:\s*([0-9.-]+)/);
      
      if (latMatch && !latMatch[1].includes('---') && !latMatch[1].includes('Error')) {
        lat = parseFloat(latMatch[1]);
      }
      
      if (lonMatch && !lonMatch[1].includes('---') && !lonMatch[1].includes('Error')) {
        lon = parseFloat(lonMatch[1]);
      }
      
      // Parse temperature and humidity
      const tempMatch = message.match(/Temperature:\s*([0-9.-]+)/);
      const humidityMatch = message.match(/Humidity:\s*([0-9.-]+)/);
      
      if (tempMatch && !tempMatch[1].includes('Error')) {
        temperature = parseFloat(tempMatch[1]);
      }
      
      if (humidityMatch && !humidityMatch[1].includes('Error')) {
        humidity = parseFloat(humidityMatch[1]);
      }
      
      return { id, timestamp, temperature, humidity, lat, lon };
    } catch (err) {
      console.error('Error parsing ESP32 message:', err);
      return null;
    }
  };
  
  // WebSocket connection management
  const connectWebSocket = () => {
    setConnectionState(prev => ({ 
      ...prev, 
      status: 'Connecting...', 
      error: null 
    }));
    
    try {
      // Close existing connection
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      // Create new connection
      const ws = new WebSocket(ESP32_WS_URL);
      wsRef.current = ws;
      
      // Connection opened
      ws.onopen = () => {
        setConnectionState(prev => ({
          ...prev,
          status: 'Connected',
          isConnected: true,
          error: null
        }));
      };
      
      // Listen for messages
      ws.onmessage = (event) => {
        const currentTime = new Date().toLocaleString();
        setConnectionState(prev => ({
          ...prev,
          lastReceived: currentTime
        }));
        
        // Parse the message
        const parsedData = parseESP32Message(event.data);
        
        if (parsedData) {
          // Update latest data
          setLatestData(parsedData);
          
          // Add to history (limit to last 100)
          setDeviceData(prev => {
            const newData = [...prev, parsedData];
            return newData.slice(-100);
          });
          
          // Update map center if we have coordinates
          if (parsedData.lat !== null && parsedData.lon !== null) {
            setMapCenter([parsedData.lat, parsedData.lon]);
          }
        }
      };
      
      // Connection closed
      ws.onclose = (event) => {
        setConnectionState(prev => ({
          ...prev,
          status: 'Disconnected',
          isConnected: false,
          error: event.wasClean ? 
            `Connection closed (Code: ${event.code})` : 
            'Connection died unexpectedly'
        }));
      };
      
      // Error handling
      ws.onerror = () => {
        setConnectionState(prev => ({
          ...prev,
          status: 'Error',
          isConnected: false,
          error: 'WebSocket connection error'
        }));
      };
      
    } catch (err) {
      setConnectionState(prev => ({
        ...prev,
        status: 'Error',
        isConnected: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      }));
    }
  };
  
  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setConnectionState(prev => ({
        ...prev,
        status: 'Disconnected',
        isConnected: false,
        error: null
      }));
    }
  };
  
  // Connect on component mount
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // Get valid tracking points for the map
  const validTrackingPoints = deviceData.filter(
    point => point.lat !== null && point.lon !== null
  );
  
  // Get polyline points for the path
  const polylinePoints = validTrackingPoints
    .map(point => (point.lat !== null && point.lon !== null) ? 
      [point.lat, point.lon] as [number, number] : null)
    .filter(Boolean) as [number, number][];
  
  // Status indicators
  const { status, isConnected, error, lastReceived } = connectionState;
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ESP32 Live Tracking Map</h1>
      
      {/* Connection Status Card */}
      <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 
              status === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">{status}</span>
            {error && <span className="text-sm text-red-500 ml-2">({error})</span>}
          </div>
          
          {lastReceived && (
            <span className="text-sm text-gray-500">
              Last received: {lastReceived}
            </span>
          )}
        </div>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={connectWebSocket}
            disabled={isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {status === 'Connecting...' ? 'Connecting...' : 'Connect'}
          </button>
          
          <button
            onClick={disconnectWebSocket}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Location Map</h2>
          
          {!isConnected ? (
            <div className="flex justify-center items-center h-96 bg-gray-100 rounded">
              <p className="text-gray-500">Connect to ESP32 to view live tracking data</p>
            </div>
          ) : validTrackingPoints.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-96 bg-gray-100 rounded">
              <p className="text-gray-500 mb-2">No location data available yet</p>
              <p className="text-sm text-gray-400">Waiting for valid GPS coordinates from ESP32...</p>
            </div>
          ) : (
            <div className="h-96 rounded overflow-hidden border">
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: '100%', width: '100%' }}
                whenCreated={(map) => {
                  setMapRef(map);
                  map.on('zoom', () => setMapZoom(map.getZoom()));
                }}
              >
                <MapController center={mapCenter} />
                
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Path line - Google Maps style - only show when toggled */}
                {showPath && polylinePoints.length > 1 && (
                  <Polyline 
                    positions={polylinePoints}
                    pathOptions={{ 
                      color: '#4285F4', // Google Maps blue
                      weight: 5, 
                      opacity: 0.8,
                      lineCap: 'round',
                      lineJoin: 'round',
                      dashArray: null
                    }}
                  />
                )}
                
                {/* Markers */}
                {validTrackingPoints.map((point, index) => {
                  const isLatest = index === validTrackingPoints.length - 1;
                  const date = new Date(point.timestamp);
                  
                  if (point.lat === null || point.lon === null) return null;
                  
                  return (
                    <React.Fragment key={index}>
                      {/* Only display a small pulse circle for current location */}
                      {isLatest && (
                        <Circle
                          center={[point.lat, point.lon]}
                          radius={5}
                          pathOptions={{ 
                            fillColor: '#4285F4',
                            fillOpacity: 0.3,
                            weight: 1,
                            color: '#4285F4'
                          }}
                        />
                      )}
                      
                      {/* Only show the latest marker by default, show all if path is enabled */}
                      {(isLatest || showPath) && (
                        <Marker 
                          position={[point.lat, point.lon]} 
                          icon={isLatest ? currentLocationIcon : null}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-bold">{isLatest ? 'Current Location' : 'Historical Location'}</p>
                              <p>Device ID: {point.id}</p>
                              <p>Time: {date.toLocaleTimeString()}</p>
                              <p>Date: {date.toLocaleDateString()}</p>
                              <p>Temperature: {point.temperature !== 'Error' ? `${point.temperature}°C` : 'Error'}</p>
                              <p>Humidity: {point.humidity !== 'Error' ? `${point.humidity}%` : 'Error'}</p>
                              <p>Coordinates: {point.lat.toFixed(6)}, {point.lon.toFixed(6)}</p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </div>
        
        {/* Device Information Section */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Device Information</h2>
          
          {latestData ? (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded border">
                <h3 className="font-medium text-lg">Device ID: {latestData.id}</h3>
                
                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={isConnected ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                      {isConnected ? "Connected" : "Disconnected"}
                    </span>
                  </p>
                  
                  <p>
                    <span className="font-medium">Last Update:</span>
                    <span className="ml-2">{new Date(latestData.timestamp).toLocaleString()}</span>
                  </p>
                </div>
              </div>
              
              {/* Sensor Data */}
              <div className="p-3 bg-gray-50 rounded border">
                <h3 className="font-medium">Sensor Readings</h3>
                <div className="mt-2 space-y-3">
                  {/* Temperature */}
                  <div className="flex items-center">
                    <span className="font-medium w-24">Temperature:</span>
                    {latestData.temperature !== 'Error' ? (
                      <div className="flex items-center">
                        <span className="text-xl">{latestData.temperature}°C</span>
                        <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-red-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, (latestData.temperature as number) * 2.5)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-500">Error reading temperature</span>
                    )}
                  </div>
                  
                  {/* Humidity */}
                  <div className="flex items-center">
                    <span className="font-medium w-24">Humidity:</span>
                    {latestData.humidity !== 'Error' ? (
                      <div className="flex items-center">
                        <span className="text-xl">{latestData.humidity}%</span>
                        <div className="ml-2 w-24 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.min(100, latestData.humidity !== 'Error' ? Number(latestData.humidity) : 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-500">Error reading humidity</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Location Data */}
              <div className="p-3 bg-gray-50 rounded border">
                <h3 className="font-medium">Location Data</h3>
                <div className="mt-2 space-y-1 text-sm">
                  {latestData.lat !== null && latestData.lon !== null ? (
                    <>
                      <p><span className="font-medium">Latitude:</span> {latestData.lat.toFixed(6)}</p>
                      <p><span className="font-medium">Longitude:</span> {latestData.lon.toFixed(6)}</p>
                      <div className="mt-2 pt-2 border-t">
                        <a 
                          href={`https://www.google.com/maps?q=${latestData.lat},${latestData.lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          View on Google Maps
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      </div>
                    </>
                  ) : (
                    <p className="text-yellow-600">
                      Waiting for GPS coordinates...
                      <span className="block mt-1 text-xs text-gray-500">
                        Location data is currently not available from the ESP32
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-100 rounded">
              <p className="text-gray-500">No data received yet</p>
            </div>
          )}
          
          {/* Map Controls */}
          <div className="mt-4 p-3 bg-gray-50 rounded border">
            <h3 className="font-medium mb-2">Map Controls</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  if (latestData?.lat && latestData?.lon) {
                    setMapCenter([latestData.lat, latestData.lon]);
                    setMapZoom(18); // Higher zoom level for better visibility
                  }
                }}
                disabled={!latestData?.lat || !latestData?.lon}
                className="w-full px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Center on Current Location
              </button>
              
              <button
                onClick={() => {
                  setShowPath(!showPath);
                  
                  // If showing path and we have multiple points, fit bounds
                  if (!showPath && polylinePoints.length > 1 && mapRef) {
                    const bounds = L.latLngBounds(polylinePoints);
                    if (bounds.isValid()) {
                      mapRef.fitBounds(bounds, { padding: [50, 50] });
                    }
                  }
                }}
                disabled={polylinePoints.length < 2}
                className={`w-full px-3 py-1.5 text-sm rounded mt-2 ${
                  showPath 
                    ? "bg-gray-500 text-white hover:bg-gray-600" 
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } disabled:opacity-50`}
              >
                {showPath ? "Hide Travel Path" : "Show Travel Path"}
              </button>
              
              <button
                onClick={() => {
                  setDeviceData([]);
                  setLatestData(null);
                  setShowPath(false);
                }}
                className="w-full px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mt-2"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data History Table */}
      {deviceData.length > 0 && (
        <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Data History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border text-left">Time</th>
                  <th className="p-2 border text-left">Temperature</th>
                  <th className="p-2 border text-left">Humidity</th>
                  <th className="p-2 border text-left">Latitude</th>
                  <th className="p-2 border text-left">Longitude</th>
                </tr>
              </thead>
              <tbody>
                {[...deviceData].reverse().slice(0, 10).map((data, index) => {
                  const date = new Date(data.timestamp);
                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="p-2 border">{date.toLocaleString()}</td>
                      <td className="p-2 border">
                        {data.temperature !== 'Error' ? `${data.temperature}°C` : 'Error'}
                      </td>
                      <td className="p-2 border">
                        {data.humidity !== 'Error' ? `${data.humidity}%` : 'Error'}
                      </td>
                      <td className="p-2 border">
                        {data.lat !== null ? data.lat.toFixed(6) : 'N/A'}
                      </td>
                      <td className="p-2 border">
                        {data.lon !== null ? data.lon.toFixed(6) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESP32TrackingMap;