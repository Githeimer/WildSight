"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ConnectionPanel from '@/components/sidebar/ConnectionPannel';
import AnimalList from '@/components/sidebar/AnimalList';
import AnimalDetails from '@/components/sidebar/AnimalDetails';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useTrackingData } from '@/hooks/useTrackingData';

// Import the map component dynamically to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('../../../components/sidebar/TrackingMap'), {
  ssr: false, // Disable server-side rendering for Leaflet
  loading: () => (
    <div className="flex justify-center items-center h-96 bg-gray-100 rounded">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

export default function LiveTrackingPage() {
  // State for animals and devices
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [showPaths, setShowPaths] = useState<{[animalId: number]: boolean}>({});
  const [dataViewMode, setDataViewMode] = useState<'temperature' | 'humidity'>('temperature');
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.619605, 85.537153]);
  const [mapZoom, setMapZoom] = useState(14);
  
  // Use custom hooks for tracking data
  const {
    devices,
    animals,
    trackingData,
    latestData,
    storageStatus,
    loading,
    error: dataError,
    fetchTrackingData,
    addTrackingData,
    hasRealTrackingData
  } = useTrackingData();
  
  // Use WebSocket hook for live data
  const {
    wsStatus,
    wsConnected,
    lastReceived,
    activeDeviceId,
    dataStorageStatus,
    error: wsError,
    connectWebSocket,
    disconnectWebSocket,
    updateStorageStatus
  } = useWebSocket({
    wsUrl: 'ws://192.168.77.15',
    onMessage: (parsedData) => {
      if (parsedData) {
        // Store the data and update UI
        addTrackingData(parsedData)
          .then(() => {
            // Find the associated animal if any
            const animal = animals.find(a => a.device_id === parsedData.device_id);
            
            // Update WebSocket status to show storage result
            updateStorageStatus(true, `Data from device ${parsedData.device_id}${animal ? ` (${animal.tag_id})` : ''} stored in database`);
            
            // Auto-select the animal if not already selected
            if (animal && !selectedAnimals.includes(animal.id)) {
              handleAnimalAutoSelect(animal.id);
            }
          })
          .catch(err => {
            console.error("Error adding tracking data:", err);
            updateStorageStatus(false, "Failed to store data in database");
          });
      }
    }
  });
  
  // Handle auto-selection of animal when receiving data
  const handleAnimalAutoSelect = (animalId: number) => {
    console.log(`Auto-selecting animal ${animalId} due to incoming data`);
    
    // Add to selected animals if not already there
    setSelectedAnimals(prev => {
      if (!prev.includes(animalId)) {
        return [...prev, animalId];
      }
      return prev;
    });
    
    // Set as the primary selected animal
    setSelectedAnimal(animalId);
    
    // Find the animal to get its device data
    const animal = animals.find(a => a.id === animalId);
    if (animal && animal.device_id && latestData[animal.device_id]) {
      const data = latestData[animal.device_id];
      
      // Center map on this animal
      if (data.lat && data.lon) {
        setMapCenter([data.lat, data.lon]);
        setMapZoom(15); // Zoom in a bit
      }
    }
  };
  
  // Animal selection handlers
  const toggleAnimalSelection = (animalId: number) => {
    setSelectedAnimals(prev => {
      if (prev.includes(animalId)) {
        // Remove from selection
        const newSelection = prev.filter(id => id !== animalId);
        // Update selected animal if currently selected one is being removed
        if (selectedAnimal === animalId && newSelection.length > 0) {
          setSelectedAnimal(newSelection[0]);
        } else if (newSelection.length === 0) {
          setSelectedAnimal(null);
        }
        return newSelection;
      } else {
        // Add to selection
        const newSelection = [...prev, animalId];
        // Update selected animal if none currently selected
        if (selectedAnimal === null) {
          setSelectedAnimal(animalId);
        }
        return newSelection;
      }
    });
  };
  
  // Toggle path visibility
  const togglePath = (animalId: number) => {
    setShowPaths(prev => ({
      ...prev,
      [animalId]: !prev[animalId]
    }));
  };
  
  // Center map on specific animal
  const centerOnAnimal = (animalId: number) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal) return;
    
    const deviceData = latestData[animal.device_id];
    if (deviceData?.lat && deviceData?.lon) {
      setMapCenter([deviceData.lat, deviceData.lon]);
      setMapZoom(17);
      setSelectedAnimal(animalId);
    }
  };
  
  // Highlight the animal associated with active device
  const getAnimalHighlight = (animalId: number) => {
    const animal = animals.find(a => a.id === animalId);
    if (!animal || !animal.device_id) return false;
    
    return animal.device_id === activeDeviceId;
  };
  
  // Filter animals that have actual tracking data
  const animalsWithData = animals.filter(animal => 
    hasRealTrackingData(animal.id) || animal.device_id === activeDeviceId
  );
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Animal Tracking System</h1>
      
      {/* Connection Status Card - Enhanced with device and animal info */}
      <ConnectionPanel 
        wsStatus={wsStatus}
        wsConnected={wsConnected}
        lastReceived={lastReceived}
        activeDeviceId={activeDeviceId}
        dataStorageStatus={dataStorageStatus}
        error={wsError}
        animals={animals}
        devices={devices}
        onConnect={connectWebSocket}
        onDisconnect={disconnectWebSocket}
      />
      
      {/* Loading or Error States */}
      {(loading.devices || loading.animals) ? (
        <div className="bg-white p-8 rounded-lg border shadow-sm mb-6 text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-500 rounded-full mb-4"></div>
          <p className="text-gray-700">Loading animals and devices...</p>
        </div>
      ) : (dataError.devices || dataError.animals) ? (
        <div className="bg-white p-8 rounded-lg border shadow-sm mb-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-500 font-medium mb-2">Error loading data</p>
          <p className="text-gray-700">{dataError.devices || dataError.animals}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      ) : (animals.length === 0) ? (
        <div className="bg-white p-8 rounded-lg border shadow-sm mb-6 text-center">
          <p className="text-gray-700 mb-2">No animals found in the database</p>
          <p className="text-sm text-gray-500">Add animals to your database to start tracking</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Animal Selection Panel - Enhanced with active device highlight */}
          <AnimalList 
            animals={animals}
            devices={devices}
            selectedAnimals={selectedAnimals}
            showPaths={showPaths}
            dataViewMode={dataViewMode}
            activeDeviceId={activeDeviceId}
            hasRealTrackingData={hasRealTrackingData}
            getAnimalHighlight={getAnimalHighlight}
            onAnimalSelect={toggleAnimalSelection}
            onTogglePath={togglePath}
            onCenterAnimal={centerOnAnimal}
            onDataViewModeChange={setDataViewMode}
          />
          
          {/* Map Section */}
          <div className="md:col-span-3 bg-white p-4 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Location Map</h2>
            
            {!wsConnected && Object.keys(latestData).length === 0 ? (
              <div className="flex justify-center items-center h-96 bg-gray-100 rounded">
                <p className="text-gray-500">Connect to view live tracking data</p>
              </div>
            ) : animalsWithData.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-96 bg-gray-100 rounded">
                <p className="text-gray-500 mb-2">No tracking data available yet</p>
                <p className="text-sm text-gray-400">
                  {wsConnected 
                    ? "Waiting for data from tracking devices..." 
                    : "Connect WebSocket to receive live data"}
                </p>
              </div>
            ) : (
              <TrackingMap 
                animals={animals}
                selectedAnimals={selectedAnimals}
                trackingData={trackingData}
                showPaths={showPaths}
                mapCenter={mapCenter}
                mapZoom={mapZoom}
                dataViewMode={dataViewMode}
                activeDeviceId={activeDeviceId}
                hasRealTrackingData={hasRealTrackingData}
                togglePath={togglePath}
                setMapZoom={setMapZoom}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Selected Animal Details - Show real-time data for selected animal */}
      {selectedAnimal && !loading.devices && !loading.animals && (
        <AnimalDetails 
          selectedAnimalId={selectedAnimal}
          animals={animals}
          devices={devices}
          latestData={latestData}
          togglePath={togglePath}
          showPaths={showPaths}
          isHighlighted={getAnimalHighlight(selectedAnimal)}
          hasRealTrackingData={hasRealTrackingData}
        />
      )}
    </div>
  );
}