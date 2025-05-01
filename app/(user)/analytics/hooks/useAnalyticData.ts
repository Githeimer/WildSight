"use client";

import { useState, useCallback, useEffect } from 'react';
import { 
  Animal, 
  Device, 
  TrackingData, 
  AnalyticsData, 
  OverviewStats, 
  TimeSeriesData,
  AnimalStats
} from '../utils/types';
import { 
  processTemperatureData, 
  processHumidityData, 
  processMovementData, 
  processActivityData, 
  calculateAnimalStats 
} from '../utils/dataProcessing';

type DateRangeType = {
  startDate: Date;
  endDate: Date;
};

// Create default empty animal stats
const createDefaultAnimalStats = (): AnimalStats => ({
  totalDataPoints: 0,
  avgTemperature: 0,
  avgHumidity: 0,
  distanceTraveled: 0,
  maxSpeed: 0,
  avgSpeed: 0,
  maxTemperature: 0,
  minTemperature: 0,
  maxHumidity: 0,
  minHumidity: 0,
  timeOfDayDistribution: {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  }
});

export function useAnalyticsData() {
  // State for entities
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [trackingData, setTrackingData] = useState<{[deviceId: string]: TrackingData[]}>({});
  
  // State for processed analytics data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    temperatureData: [],
    humidityData: [],
    movementData: {},
    activityData: [],
    animalStats: {}
  });
  
  // Overview statistics
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalAnimals: 0,
    activeDevices: 0,
    totalDataPoints: 0,
    avgTemperature: 0,
    avgHumidity: 0,
    lastUpdated: null
  });
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    animals: true,
    devices: true,
    trackingData: false,
    analytics: false
  });
  
  const [error, setError] = useState({
    animals: null as string | null,
    devices: null as string | null,
    trackingData: null as string | null,
    analytics: null as string | null
  });
  
  // Fetch animals
  const fetchAnimals = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, animals: true }));
      
      // Use /api/animal (singular) endpoint as we've updated the routes
      const response = await fetch('/api/animal');
      if (!response.ok) {
        throw new Error(`Failed to fetch animals: ${response.status}`);
      }
      
      const data = await response.json();
      setAnimals(data);
      setIsLoading(prev => ({ ...prev, animals: false }));
      setError(prev => ({ ...prev, animals: null }));
      
      console.log("Fetched animals:", data);
    } catch (err: any) {
      console.error('Error fetching animals:', err);
      setError(prev => ({ ...prev, animals: err.message }));
      setIsLoading(prev => ({ ...prev, animals: false }));
    }
  }, []);
  
  // Fetch devices
  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, devices: true }));
      const response = await fetch('/api/devices/all');
      if (!response.ok) {
        throw new Error(`Failed to fetch devices: ${response.status}`);
      }
      
      const data = await response.json();
      const devicesArray = data.devices || data; // Handle different response formats
      setDevices(devicesArray);
      setIsLoading(prev => ({ ...prev, devices: false }));
      setError(prev => ({ ...prev, devices: null }));
      
      console.log("Fetched devices:", devicesArray);
    } catch (err: any) {
      console.error('Error fetching devices:', err);
      setError(prev => ({ ...prev, devices: err.message }));
      setIsLoading(prev => ({ ...prev, devices: false }));
    }
  }, []);
  
  // Fetch tracking data for a specific date range and animal
  const fetchTrackingData = useCallback(async (
    dateRange: DateRangeType, 
    animalId: number | null = null
  ) => {
    try {
      setIsLoading(prev => ({ ...prev, trackingData: true }));
      
      // Construct the URL with query parameters
      let url = '/api/analytics/tracking?';
      url += `start_date=${dateRange.startDate.toISOString()}`;
      url += `&end_date=${dateRange.endDate.toISOString()}`;
      
      if (animalId !== null) {
        // Find the device ID for this animal
        const animal = animals.find(a => a.id === animalId);
        if (animal && animal.device_id) {
          url += `&device_id=${animal.device_id}`;
        }
      }
      
      console.log("Fetching tracking data from URL:", url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch tracking data: ${response.status}`);
      }
      
      const responseData = await response.json();
      const trackingData = responseData.data || {};
      
      setTrackingData(trackingData);
      setIsLoading(prev => ({ ...prev, trackingData: false }));
      setError(prev => ({ ...prev, trackingData: null }));
      
      console.log("Fetched tracking data:", trackingData);
      return trackingData;
    } catch (err: any) {
      console.error('Error fetching tracking data:', err);
      setError(prev => ({ ...prev, trackingData: err.message }));
      setIsLoading(prev => ({ ...prev, trackingData: false }));
      
      // Return empty object on error to allow processing to continue
      return {};
    }
  }, [animals]);
  
  // Process analytics data
  const processAnalyticsData = useCallback((data: {[deviceId: string]: TrackingData[]}) => {
    try {
      setIsLoading(prev => ({ ...prev, analytics: true }));
      
      // If no data, set empty analytics results
      if (Object.keys(data).length === 0) {
        setAnalyticsData({
          temperatureData: [],
          humidityData: [],
          movementData: {},
          activityData: [],
          animalStats: {}
        });
        
        setOverviewStats({
          totalAnimals: animals.length,
          activeDevices: devices.filter(d => d.isactive).length,
          totalDataPoints: 0,
          avgTemperature: 0,
          avgHumidity: 0,
          lastUpdated: new Date()
        });
        
        setIsLoading(prev => ({ ...prev, analytics: false }));
        return;
      }
      
      // Create a mapping from device IDs to animal IDs
      const deviceToAnimal: {[deviceId: string]: number} = {};
      animals.forEach(animal => {
        if (animal.device_id) {
          deviceToAnimal[animal.device_id.toString()] = animal.id;
        }
      });
      
      console.log("Processing data with device-to-animal mapping:", deviceToAnimal);
      
      // Process each type of analytics data
      const temperatureData = processTemperatureData(data, deviceToAnimal);
      const humidityData = processHumidityData(data, deviceToAnimal);
      const movementData = processMovementData(data, deviceToAnimal);
      const activityData = processActivityData(data, deviceToAnimal);
      
      // Calculate individual animal statistics with default values
      let animalStats: {[animalId: number]: AnimalStats} = {};
      
      try {
        animalStats = calculateAnimalStats(data, deviceToAnimal);
      } catch (statsError) {
        console.error("Error calculating animal stats:", statsError);
        // Create default stats for each animal
        animals.forEach(animal => {
          animalStats[animal.id] = createDefaultAnimalStats();
        });
      }
      
      // Update analytics data state
      setAnalyticsData({
        temperatureData,
        humidityData,
        movementData,
        activityData,
        animalStats
      });
      
      // Calculate overview statistics
      let totalDataPoints = 0;
      let totalTemperature = 0;
      let totalHumidity = 0;
      let datapointsWithTemp = 0;
      let datapointsWithHumidity = 0;
      
      Object.values(data).forEach(deviceData => {
        totalDataPoints += deviceData.length;
        
        deviceData.forEach(point => {
          if (point.temperature !== undefined && !isNaN(point.temperature)) {
            totalTemperature += point.temperature;
            datapointsWithTemp++;
          }
          
          if (point.humidity !== undefined && !isNaN(point.humidity)) {
            totalHumidity += point.humidity;
            datapointsWithHumidity++;
          }
        });
      });
      
      setOverviewStats({
        totalAnimals: animals.length,
        activeDevices: devices.filter(d => d.isactive).length,
        totalDataPoints,
        avgTemperature: datapointsWithTemp > 0 ? totalTemperature / datapointsWithTemp : 0,
        avgHumidity: datapointsWithHumidity > 0 ? totalHumidity / datapointsWithHumidity : 0,
        lastUpdated: new Date()
      });
      
      setIsLoading(prev => ({ ...prev, analytics: false }));
      setError(prev => ({ ...prev, analytics: null }));
    } catch (err: any) {
      console.error('Error processing analytics data:', err);
      setError(prev => ({ ...prev, analytics: err.message }));
      setIsLoading(prev => ({ ...prev, analytics: false }));
    }
  }, [animals, devices]);
  
  // Combined function to fetch and process analytics data
  const fetchAnalyticsData = useCallback(async (
    dateRange: DateRangeType, 
    animalId: number | null = null
  ) => {
    try {
      const data = await fetchTrackingData(dateRange, animalId);
      processAnalyticsData(data);
    } catch (err) {
      console.error("Error in fetchAnalyticsData:", err);
      // Continue with empty data to show UI without analytics
      processAnalyticsData({});
    }
  }, [fetchTrackingData, processAnalyticsData]);
  
  // Fetch animals and devices on mount
  useEffect(() => {
    fetchAnimals();
    fetchDevices();
  }, [fetchAnimals, fetchDevices]);
  
  return {
    animals,
    devices,
    trackingData,
    analyticsData,
    overviewStats,
    isLoading,
    error,
    fetchAnalyticsData,
  };
}