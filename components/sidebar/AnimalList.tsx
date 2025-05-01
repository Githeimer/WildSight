import React from 'react';
import { Animal, Device, speciesColors, speciesIcons } from '@/utils/types';

interface AnimalListProps {
  animals: Animal[];
  devices: Device[];
  selectedAnimals: number[];
  showPaths: {[animalId: number]: boolean};
  dataViewMode: 'temperature' | 'humidity';
  activeDeviceId: number | null;
  hasRealTrackingData: (animalId: number) => boolean;
  getAnimalHighlight: (animalId: number) => boolean;
  onAnimalSelect: (animalId: number) => void;
  onTogglePath: (animalId: number) => void;
  onCenterAnimal: (animalId: number) => void;
  onDataViewModeChange: (mode: 'temperature' | 'humidity') => void;
}

const AnimalList: React.FC<AnimalListProps> = ({
  animals,
  devices,
  selectedAnimals,
  showPaths,
  dataViewMode,
  activeDeviceId,
  hasRealTrackingData,
  getAnimalHighlight,
  onAnimalSelect,
  onTogglePath,
  onCenterAnimal,
  onDataViewModeChange
}) => {
  // Get color for an animal
  const getAnimalColor = (animal: Animal) => {
    const species = animal.species || 'default';
    return speciesColors[species] || speciesColors.default;
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Animals</h2>
      
      {/* Legend for status indicators */}
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
        <div className="font-medium mb-1">Status Indicators</div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Has tracking data</span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span>Active device (receiving data)</span>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <span>No data available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Device assigned but not connected</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {animals.map(animal => {
          const isSelected = selectedAnimals.includes(animal.id);
          const showPath = showPaths[animal.id] || false;
          const hasData = hasRealTrackingData(animal.id);
          const isActive = getAnimalHighlight(animal.id);
          const device = devices.find(d => d.id === animal.device_id);
          const color = getAnimalColor(animal);
          
          return (
            <div 
              key={animal.id} 
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : isSelected 
                    ? `border-gray-500 bg-gray-50` 
                    : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onAnimalSelect(animal.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    {speciesIcons[animal.species] || speciesIcons.default}
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {animal.tag_id}
                      {isActive && (
                        <span className="inline-flex ml-2 items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {animal.species} ({animal.sex})
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`w-3 h-3 rounded-full ${
                    isActive 
                      ? 'bg-blue-500 animate-pulse' 
                      : hasData 
                        ? 'bg-green-500' 
                        : animal.device_id 
                          ? 'bg-yellow-500'
                          : 'bg-gray-300'
                  }`}></div>
                  <span className="text-xs mt-1">
                    {isActive 
                      ? 'Active' 
                      : hasData 
                        ? 'Has Data'
                        : animal.device_id
                          ? 'Device assigned'
                          : 'No data'}
                  </span>
                </div>
              </div>
              
              {isSelected && (
                <div className="mt-3 pt-2 border-t border-gray-200 flex flex-col space-y-2">
                  <div className="text-xs text-gray-500">
                    Device: {device ? (
                      <span className={isActive ? 'font-medium text-blue-600' : ''}>
                        {device.serial_number} {isActive ? '(Connected)' : '(Not connected)'}
                      </span>
                    ) : 'None'}
                  </div>
                  
                  {hasData ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCenterAnimal(animal.id);
                        }}
                        className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Center on Map
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePath(animal.id);
                        }}
                        className={`px-2 py-1 text-sm rounded ${
                          showPath 
                            ? 'bg-gray-500 text-white hover:bg-gray-600'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {showPath ? 'Hide Path' : 'Show Path'}
                      </button>
                    </>
                  ) : (
                    <div className="px-2 py-1 bg-gray-100 text-gray-500 text-sm rounded text-center">
                      {animal.device_id 
                        ? "Device needs to connect and send data" 
                        : "No tracking device assigned"}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t">
        <h3 className="font-medium mb-2">Data Visualization</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onDataViewModeChange('temperature')}
            className={`px-3 py-1.5 text-sm rounded flex-1 ${
              dataViewMode === 'temperature' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Temperature
          </button>
          <button
            onClick={() => onDataViewModeChange('humidity')}
            className={`px-3 py-1.5 text-sm rounded flex-1 ${
              dataViewMode === 'humidity' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Humidity
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimalList;