import { 
    TrackingData, 
    TimeSeriesData, 
    TimeSeriesDataPoint, 
    MovementDataPoint,
    AnimalStats
  } from './types';
  
  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 Latitude of point 1
   * @param lon1 Longitude of point 1
   * @param lat2 Latitude of point 2
   * @param lon2 Longitude of point 2
   * @returns Distance in kilometers
   */
  export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (lat1 === 0 || lon1 === 0 || lat2 === 0 || lon2 === 0) {
      return 0; // Handle invalid coordinates
    }
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return Math.round(distance * 100) / 100; // Round to 2 decimals
  };
  
  /**
   * Convert degrees to radians
   */
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  /**
   * Calculate speed between two points in km/h
   */
  export const calculateSpeed = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number, 
    timestamp1: string, 
    timestamp2: string
  ): number => {
    // Calculate distance in kilometers
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    
    // Calculate time difference in hours
    const time1 = new Date(timestamp1).getTime();
    const time2 = new Date(timestamp2).getTime();
    const timeDiffHours = (time2 - time1) / (1000 * 60 * 60);
    
    // Calculate speed in km/h
    if (timeDiffHours > 0) {
      return Math.round((distance / timeDiffHours) * 100) / 100;
    }
    
    return 0;
  };
  
  /**
   * Group tracking data by day for time-series visualization
   */
  export const groupByDay = (data: TrackingData[]): {[day: string]: TrackingData[]} => {
    const grouped: {[day: string]: TrackingData[]} = {};
    
    if (!Array.isArray(data)) {
      console.warn("Invalid data passed to groupByDay:", data);
      return {};
    }
    
    data.forEach(point => {
      if (!point || !point.timestamp) {
        console.warn("Invalid data point in groupByDay:", point);
        return;
      }
      
      try {
        const date = new Date(point.timestamp);
        const day = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        if (!grouped[day]) {
          grouped[day] = [];
        }
        
        grouped[day].push(point);
      } catch (err) {
        console.warn("Error processing timestamp in groupByDay:", err);
      }
    });
    
    return grouped;
  };
  
  /**
   * Calculate average value for a day
   */
  export const calculateDailyAverage = (
    points: TrackingData[], 
    property: 'temperature' | 'humidity'
  ): number => {
    if (!Array.isArray(points) || points.length === 0) return 0;
    
    let sum = 0;
    let count = 0;
    
    points.forEach(point => {
      if (point && point[property] !== undefined && !isNaN(point[property])) {
        sum += point[property];
        count++;
      }
    });
    
    return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  };
  
  /**
   * Process temperature data for time-series visualization
   */
  export const processTemperatureData = (
    data: {[deviceId: string]: TrackingData[]},
    deviceToAnimal: {[deviceId: string]: number}
  ): TimeSeriesData[] => {
    const result: TimeSeriesData[] = [];
    
    // Process each device's data
    Object.entries(data).forEach(([deviceId, deviceData]) => {
      const animalId = deviceToAnimal[deviceId];
      if (!animalId) return;
      
      // Skip if device data is not array or empty
      if (!Array.isArray(deviceData) || deviceData.length === 0) return;
      
      const groupedByDay = groupByDay(deviceData);
      const timeSeriesData: TimeSeriesDataPoint[] = [];
      
      // Calculate daily average temperatures
      Object.entries(groupedByDay)
        .sort(([day1], [day2]) => day1.localeCompare(day2))
        .forEach(([day, points]) => {
          const avgTemp = calculateDailyAverage(points, 'temperature');
          timeSeriesData.push({
            timestamp: day,
            value: avgTemp,
            animalId
          });
        });
      
      if (timeSeriesData.length > 0) {
        result.push({
          animalId,
          data: timeSeriesData
        });
      }
    });
    
    return result;
  };
  
  /**
   * Process humidity data for time-series visualization
   */
  export const processHumidityData = (
    data: {[deviceId: string]: TrackingData[]},
    deviceToAnimal: {[deviceId: string]: number}
  ): TimeSeriesData[] => {
    const result: TimeSeriesData[] = [];
    
    // Process each device's data
    Object.entries(data).forEach(([deviceId, deviceData]) => {
      const animalId = deviceToAnimal[deviceId];
      if (!animalId) return;
      
      // Skip if device data is not array or empty
      if (!Array.isArray(deviceData) || deviceData.length === 0) return;
      
      const groupedByDay = groupByDay(deviceData);
      const timeSeriesData: TimeSeriesDataPoint[] = [];
      
      // Calculate daily average humidity
      Object.entries(groupedByDay)
        .sort(([day1], [day2]) => day1.localeCompare(day2))
        .forEach(([day, points]) => {
          const avgHumidity = calculateDailyAverage(points, 'humidity');
          timeSeriesData.push({
            timestamp: day,
            value: avgHumidity,
            animalId
          });
        });
      
      if (timeSeriesData.length > 0) {
        result.push({
          animalId,
          data: timeSeriesData
        });
      }
    });
    
    return result;
  };
  
  /**
   * Process movement data for map visualization
   */
  export const processMovementData = (
    data: {[deviceId: string]: TrackingData[]},
    deviceToAnimal: {[deviceId: string]: number}
  ): {[animalId: number]: MovementDataPoint[]} => {
    const result: {[animalId: number]: MovementDataPoint[]} = {};
    
    // Process each device's data
    Object.entries(data).forEach(([deviceId, deviceData]) => {
      const animalId = deviceToAnimal[deviceId];
      if (!animalId) return;
      
      // Skip if device data is not array or empty
      if (!Array.isArray(deviceData) || deviceData.length === 0) return;
      
      // Sort data by timestamp (oldest to newest)
      const sortedData = [...deviceData].sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      
      // Filter out invalid coordinates
      const validPoints = sortedData.filter(point => 
        point && point.lat !== 0 && point.lon !== 0
      );
      
      // Map to movement data points
      const movementPoints: MovementDataPoint[] = validPoints.map(point => ({
        timestamp: point.timestamp,
        lat: point.lat,
        lon: point.lon
      }));
      
      if (movementPoints.length > 0) {
        result[animalId] = movementPoints;
      }
    });
    
    return result;
  };
  
  /**
   * Process activity data by hour of day
   */
  export const processActivityData = (
    data: {[deviceId: string]: TrackingData[]},
    deviceToAnimal: {[deviceId: string]: number}
  ): TimeSeriesData[] => {
    const result: TimeSeriesData[] = [];
    
    // Process each device's data
    Object.entries(data).forEach(([deviceId, deviceData]) => {
      const animalId = deviceToAnimal[deviceId];
      if (!animalId) return;
      
      // Skip if device data is not array or empty
      if (!Array.isArray(deviceData) || deviceData.length === 0) return;
      
      // Group by hour of day (0-23)
      const hourCounts: {[hour: number]: number} = {};
      for (let i = 0; i < 24; i++) {
        hourCounts[i] = 0;
      }
      
      // Count data points for each hour
      deviceData.forEach(point => {
        if (!point || !point.timestamp) return;
        
        try {
          const date = new Date(point.timestamp);
          const hour = date.getHours();
          hourCounts[hour]++;
        } catch (err) {
          console.warn("Error processing timestamp in activity data:", err);
        }
      });
      
      // Convert to time series data
      const activityData: TimeSeriesDataPoint[] = Object.entries(hourCounts).map(([hour, count]) => ({
        timestamp: hour.toString(),
        value: count,
        animalId
      }));
      
      result.push({
        animalId,
        data: activityData
      });
    });
    
    return result;
  };
  
  /**
   * Calculate statistics for each animal
   */
  export const calculateAnimalStats = (
    data: {[deviceId: string]: TrackingData[]},
    deviceToAnimal: {[deviceId: string]: number}
  ): {[animalId: number]: AnimalStats} => {
    const result: {[animalId: number]: AnimalStats} = {};
    
    // Process each device's data
    Object.entries(data).forEach(([deviceId, deviceData]) => {
      const animalId = deviceToAnimal[deviceId];
      if (!animalId) return;
      
      // Skip if device data is not array or empty
      if (!Array.isArray(deviceData) || deviceData.length === 0) {
        // Create default stats
        result[animalId] = {
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
        };
        return;
      }
      
      // Sort data by timestamp (oldest to newest)
      const sortedData = [...deviceData].sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      
      // Filter out invalid coordinates for distance calculations
      const validPoints = sortedData.filter(point => 
        point && point.lat !== 0 && point.lon !== 0
      );
      
      // Calculate total distance traveled
      let distanceTraveled = 0;
      let maxSpeed = 0;
      let totalSpeed = 0;
      let speedCount = 0;
      
      for (let i = 1; i < validPoints.length; i++) {
        const prevPoint = validPoints[i-1];
        const currentPoint = validPoints[i];
        
        if (!prevPoint || !currentPoint) continue;
        
        const distance = calculateDistance(
          prevPoint.lat, prevPoint.lon,
          currentPoint.lat, currentPoint.lon
        );
        
        distanceTraveled += distance;
        
        if (!prevPoint.timestamp || !currentPoint.timestamp) continue;
        
        const speed = calculateSpeed(
          prevPoint.lat, prevPoint.lon,
          currentPoint.lat, currentPoint.lon,
          prevPoint.timestamp, currentPoint.timestamp
        );
        
        if (speed > 0) {
          maxSpeed = Math.max(maxSpeed, speed);
          totalSpeed += speed;
          speedCount++;
        }
      }
      
      // Calculate temperature and humidity stats
      let minTemp = Infinity;
      let maxTemp = -Infinity;
      let totalTemp = 0;
      let tempCount = 0;
      
      let minHumidity = Infinity;
      let maxHumidity = -Infinity;
      let totalHumidity = 0;
      let humidityCount = 0;
      
      // Time of day distribution
      let morningCount = 0;
      let afternoonCount = 0;
      let eveningCount = 0;
      let nightCount = 0;
      
      deviceData.forEach(point => {
        // Temperature
        if (point && point.temperature !== undefined && !isNaN(point.temperature)) {
          minTemp = Math.min(minTemp, point.temperature);
          maxTemp = Math.max(maxTemp, point.temperature);
          totalTemp += point.temperature;
          tempCount++;
        }
        
        // Humidity
        if (point && point.humidity !== undefined && !isNaN(point.humidity)) {
          minHumidity = Math.min(minHumidity, point.humidity);
          maxHumidity = Math.max(maxHumidity, point.humidity);
          totalHumidity += point.humidity;
          humidityCount++;
        }
        
        // Time of day
        if (point && point.timestamp) {
          try {
            const date = new Date(point.timestamp);
            const hour = date.getHours();
            
            if (hour >= 6 && hour < 12) {
              morningCount++;
            } else if (hour >= 12 && hour < 18) {
              afternoonCount++;
            } else if (hour >= 18 && hour < 24) {
              eveningCount++;
            } else {
              nightCount++;
            }
          } catch (err) {
            console.warn("Error processing timestamp for time of day:", err);
          }
        }
      });
      
      // Calculate percentages for time of day
      const totalTimePoints = morningCount + afternoonCount + eveningCount + nightCount;
      const timeOfDayDistribution = {
        morning: totalTimePoints > 0 ? Math.round((morningCount / totalTimePoints) * 100) : 0,
        afternoon: totalTimePoints > 0 ? Math.round((afternoonCount / totalTimePoints) * 100) : 0,
        evening: totalTimePoints > 0 ? Math.round((eveningCount / totalTimePoints) * 100) : 0,
        night: totalTimePoints > 0 ? Math.round((nightCount / totalTimePoints) * 100) : 0
      };
      
      // Fix for Infinity/NaN values
      if (minTemp === Infinity) minTemp = 0;
      if (maxTemp === -Infinity) maxTemp = 0;
      if (minHumidity === Infinity) minHumidity = 0;
      if (maxHumidity === -Infinity) maxHumidity = 0;
      
      // Create the animal stats object
      result[animalId] = {
        totalDataPoints: deviceData.length,
        avgTemperature: tempCount > 0 ? Math.round((totalTemp / tempCount) * 10) / 10 : 0,
        avgHumidity: humidityCount > 0 ? Math.round((totalHumidity / humidityCount) * 10) / 10 : 0,
        distanceTraveled: Math.round(distanceTraveled * 100) / 100,
        maxSpeed: Math.round(maxSpeed * 100) / 100,
        avgSpeed: speedCount > 0 ? Math.round((totalSpeed / speedCount) * 100) / 100 : 0,
        maxTemperature: Math.round(maxTemp * 10) / 10,
        minTemperature: Math.round(minTemp * 10) / 10,
        maxHumidity: Math.round(maxHumidity * 10) / 10,
        minHumidity: Math.round(minHumidity * 10) / 10,
        timeOfDayDistribution
      };
    });
    
    return result;
  };