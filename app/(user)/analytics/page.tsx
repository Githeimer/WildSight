"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAnalyticsData } from './hooks/useAnalyticData';
import OverviewStats from './components/OverviewStats';
import AnimalSelector from './components/AnimalSelector';
import DateRangePicker from './components/DateRangePicket';
import TemperatureChart from './components/TemperatureChart';
import HumidityChart from './components/HumidityChart';
import ActivityChart from './components/ActivityChart';
import AnimalDetailsStats from './components/AnimalDetailStats';
import LoadingIndicator from './components/LoadingIndicator';

// Import MovementMap dynamically with ssr: false to prevent window is not defined errors
const MovementMap = dynamic(
  () => import('./components/MovementMap'),
  { ssr: false } // This is crucial - it prevents server-side rendering
);

const AnalyticsPage = () => {
  // Date range state (default to last 7 days)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  
  // Selected animal state
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(null);
  
  // Use the analytics data hook
  const {
    animals,
    devices,
    analyticsData,
    overviewStats,
    isLoading,
    error,
    fetchAnalyticsData,
  } = useAnalyticsData();
  
  // Fetch data when date range or selected animal changes
  useEffect(() => {
    fetchAnalyticsData(dateRange, selectedAnimalId);
  }, [dateRange, selectedAnimalId, fetchAnalyticsData]);
  
  // Handle date range change
  const handleDateRangeChange = (start: Date, end: Date) => {
    setDateRange({
      startDate: start,
      endDate: end
    });
  };
  
  // Handle animal selection change
  const handleAnimalChange = (animalId: number | null) => {
    setSelectedAnimalId(animalId);
  };
  
  // If loading is in progress, show loading indicator
  if (isLoading.animals || isLoading.analytics) {
    return <LoadingIndicator message="Loading analytics data..." />;
  }
  
  // If there's an error, show error message
  if (error.animals || error.analytics) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error.animals || error.analytics}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Animal Tracking Analytics</h1>
      
      {/* Overview Statistics */}
      <OverviewStats stats={overviewStats} />
      
      {/* Filters Panel */}
      <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <AnimalSelector 
            animals={animals} 
            selectedAnimalId={selectedAnimalId} 
            onAnimalChange={handleAnimalChange} 
          />
          <DateRangePicker 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate} 
            onChange={handleDateRangeChange} 
          />
        </div>
      </div>
      
      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Temperature Chart */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Temperature Trends</h2>
          <TemperatureChart 
            data={analyticsData.temperatureData} 
            animalId={selectedAnimalId} 
            animals={animals}
          />
        </div>
        
        {/* Humidity Chart */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Humidity Trends</h2>
          <HumidityChart 
            data={analyticsData.humidityData} 
            animalId={selectedAnimalId} 
            animals={animals}
          />
        </div>
      </div>
      
      {/* Movement Map */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Movement Patterns</h2>
        <MovementMap 
          trackingData={analyticsData.movementData} 
          selectedAnimalId={selectedAnimalId} 
          animals={animals}
          height="400px"
        />
      </div>
      
      {/* Activity Chart */}
      <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Daily Activity</h2>
        <ActivityChart 
          data={analyticsData.activityData} 
          animalId={selectedAnimalId} 
          animals={animals}
        />
      </div>
      
      {/* Selected Animal Details (show only when an animal is selected) */}
      {selectedAnimalId && (
        <AnimalDetailsStats 
          animalId={selectedAnimalId} 
          animals={animals} 
          devices={devices}
          stats={analyticsData.animalStats[selectedAnimalId] || {}}
        />
      )}
    </div>
  );
};

export default AnalyticsPage;