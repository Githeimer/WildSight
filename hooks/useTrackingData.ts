"use client";

import { useState, useEffect, useCallback } from 'react';
import { Animal, Device, TrackingData } from '../utils/types';

export function useTrackingData() {
  // State for data
  const [devices, setDevices] = useState<Device[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [trackingData, setTrackingData] = useState<{[deviceId: number]: TrackingData[]}>({});
  const [latestData, setLatestData] = useState<{[deviceId: number]: TrackingData}>({});
  
  // Loading and error states
  const [loading, setLoading] = useState({
    devices: true,
    animals: true,
    tracking: false
  });
  
  const [error, setError] = useState({
    devices: null as string | null,
    animals: null as string | null,
    tracking: null as string | null
  });
  
  // Storage status for the last API operation
  const [storageStatus, setStorageStatus] = useState({
    success: false,
    message: null as string | null,
    timestamp: null as string | null,
    deviceId: null as number | null
  });
  
  // Fetch devices
  const fetchDevices = useCallback(async () => {
    try {
      console.log("Fetching devices...");
      setLoading(prev => ({ ...prev, devices: true }));
      
      const response = await fetch('/api/devices/all');
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }
      
      const data = await response.json();
      const devicesArray = data.devices || data; // Handle different response formats
      
      console.log(`Successfully fetched ${devicesArray.length} devices`);
      setDevices(devicesArray);
      setLoading(prev => ({ ...prev, devices: false }));
      setError(prev => ({ ...prev, devices: null }));
    } catch (err: any) {
      console.error('Error fetching devices:', err);
      setError(prev => ({ ...prev, devices: err.message }));
      setLoading(prev => ({ ...prev, devices: false }));
    }
  }, []);
  
  // Fetch animals
  const fetchAnimals = useCallback(async () => {
    try {
      console.log("Fetching animals...");
      setLoading(prev => ({ ...prev, animals: true }));
      
      const response = await fetch('/api/animal');
      if (!response.ok) {
        throw new Error(`Failed to fetch animals: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched ${data.length} animals`);
      setAnimals(data);
      setLoading(prev => ({ ...prev, animals: false }));
      setError(prev => ({ ...prev, animals: null }));
    } catch (err: any) {
      console.error('Error fetching animals:', err);
      setError(prev => ({ ...prev, animals: err.message }));
      setLoading(prev => ({ ...prev, animals: false }));
    }
  }, []);
  
  // Fetch tracking data for a device
  const fetchTrackingData = useCallback(async (deviceId: number) => {
    try {
      console.log(`Fetching tracking data for device ${deviceId}...`);
      setLoading(prev => ({ ...prev, tracking: true }));
      
      const response = await fetch(`/api/tracking?device_id=${deviceId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tracking data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        console.log(`Received ${data.data.length} tracking points for device ${deviceId}`);
        
        // Update tracking data
        setTrackingData(prev => ({
          ...prev,
          [deviceId]: data.data
        }));
        
        // Update latest data
        setLatestData(prev => ({
          ...prev,
          [deviceId]: data.data[0] // First item is latest due to descending order
        }));
      } else {
        console.log(`No tracking data found for device ${deviceId}`);
        
        // Ensure we don't have any data for this device
        setTrackingData(prev => {
          const newData = { ...prev };
          if (newData[deviceId]) {
            delete newData[deviceId];
          }
          return newData;
        });
        
        setLatestData(prev => {
          const newData = { ...prev };
          if (newData[deviceId]) {
            delete newData[deviceId];
          }
          return newData;
        });
      }
      
      setLoading(prev => ({ ...prev, tracking: false }));
      setError(prev => ({ ...prev, tracking: null }));
    } catch (err: any) {
      console.error(`Error fetching tracking data for device ${deviceId}:`, err);
      setError(prev => ({ ...prev, tracking: err.message }));
      setLoading(prev => ({ ...prev, tracking: false }));
    }
  }, []);
  
  // Post tracking data to API
  const postTrackingData = useCallback(async (data: TrackingData) => {
    try {
      console.log("Posting tracking data to database:", data);
      
      const response = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: data.device_id,
          timestamp: data.timestamp,
          temperature: data.temperature,
          humidity: data.humidity,
          lat: data.lat,
          lon: data.lon
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to post tracking data: ${response.status}`);
      }
      
      console.log('Tracking data stored successfully in database');
      
      // Update storage status
      setStorageStatus({
        success: true,
        message: "Data successfully stored in database",
        timestamp: new Date().toLocaleString(),
        deviceId: data.device_id
      });
      
      return true;
    } catch (err: any) {
      console.error('Error posting tracking data:', err);
      
      // Update storage status
      setStorageStatus({
        success: false,
        message: `Failed to store data: ${err.message}`,
        timestamp: new Date().toLocaleString(),
        deviceId: data.device_id
      });
      
      return false;
    }
  }, []);
  
  // Add new tracking data (from WebSocket)
  const addTrackingData = useCallback(async (newData: TrackingData) => {
    const deviceId = newData.device_id;
    
    // Update latest data
    setLatestData(prev => ({
      ...prev,
      [deviceId]: newData
    }));
    
    // Add to tracking data history
    setTrackingData(prev => {
      const deviceData = prev[deviceId] || [];
      return {
        ...prev,
        [deviceId]: [newData, ...deviceData].slice(0, 100) // Keep latest 100 points
      };
    });
    
    // Store in database
    const stored = await postTrackingData(newData);
    
    // Find associated animal for UI feedback
    const animal = animals.find(a => a.device_id === deviceId);
    
    if (stored) {
      console.log(`Data for device ${deviceId}${animal ? ` (${animal.tag_id})` : ''} stored successfully`);
    } else {
      console.error(`Failed to store data for device ${deviceId}${animal ? ` (${animal.tag_id})` : ''}`);
    }
  }, [animals, postTrackingData]);
  
  // Fetch initial data on component mount
  useEffect(() => {
    fetchDevices();
    fetchAnimals();
  }, [fetchDevices, fetchAnimals]);
  
  // Fetch tracking data for active devices once devices and animals are loaded
  useEffect(() => {
    if (!loading.devices && !loading.animals && devices.length > 0 && animals.length > 0) {
      console.log("Devices and animals loaded, checking for active devices...");
      
      // Find all active devices that are assigned to animals
      const activeDeviceIds = devices
        .filter(device => device.isactive)
        .map(device => device.id)
        .filter(deviceId => animals.some(animal => animal.device_id === deviceId));
      
      console.log(`Found ${activeDeviceIds.length} active devices with assigned animals`);
      
      // Fetch tracking data for each active device
      activeDeviceIds.forEach(deviceId => {
        fetchTrackingData(deviceId);
      });
    }
  }, [loading.devices, loading.animals, devices, animals, fetchTrackingData]);
  
  // Function to check if an animal has actual tracking data
  const hasRealTrackingData = useCallback((animalId: number): boolean => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal || !animal.device_id) return false;
    
    return Boolean(trackingData[animal.device_id]?.length > 0);
  }, [animals, trackingData]);
  
  return {
    devices,
    animals,
    trackingData,
    latestData,
    storageStatus,
    loading,
    error,
    fetchTrackingData,
    addTrackingData,
    hasRealTrackingData
  };
}