import { TrackingData } from './types';

/**
 * Parse a message from ESP32 WebSocket
 * @param message The raw message string from WebSocket
 * @returns Parsed TrackingData object or null if parsing fails
 */
export const parseESP32Message = (message: string): TrackingData | null => {
  try {
    let timestamp = new Date().toISOString();
    let device_id = null;
    let lat = null;
    let lon = null;
    let temperature = null;
    let humidity = null;
    
    // Parse the message format: [4/30/2025, 7:55:05 AM] ID: 001°C
    const timestampMatch = message.match(/\[(.*?)\]/);
    if (timestampMatch) {
      timestamp = new Date(timestampMatch[1].trim()).toISOString();
    }
    
    const idMatch = message.match(/ID:\s*([^\s°C]+)/);
    if (idMatch) {
      // Convert device ID string to number - remove any non-numeric characters
      const deviceIdStr = idMatch[1].trim().replace(/\D/g, '');
      device_id = parseInt(deviceIdStr, 10);
      if (isNaN(device_id)) {
        console.error('Could not parse device ID:', idMatch[1]);
        return null;
      }
    } else {
      console.error('No device ID found in message');
      return null;
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
    
    if (device_id === null || lat === null || lon === null || temperature === null || humidity === null) {
      console.warn('Some data is missing in message:', message);
      if (device_id === null) return null; // Device ID is required
    }
    
    return {
      id: 0, // This will be assigned by the database
      device_id,
      timestamp,
      temperature: temperature || 0,
      humidity: humidity || 0,
      lat: lat || 0,
      lon: lon || 0
    };
  } catch (err) {
    console.error('Error parsing ESP32 message:', err, message);
    return null;
  }
};

/**
 * Get valid tracking points for an animal (non-zero coordinates)
 */
export const getValidTrackingPoints = (deviceData: TrackingData[] = []) => {
  return deviceData.filter(point => point.lat !== 0 && point.lon !== 0);
};

/**
 * Get polyline points for map display from tracking data
 */
export const getPolylinePoints = (deviceData: TrackingData[] = []) => {
  const validPoints = getValidTrackingPoints(deviceData);
  return validPoints.map(point => [point.lat, point.lon] as [number, number]);
};