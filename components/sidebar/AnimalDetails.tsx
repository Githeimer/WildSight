import React from 'react';
import { Animal, Device, TrackingData, speciesColors, speciesIcons } from '@/utils/types';

interface AnimalDetailsProps {
  selectedAnimalId: number;
  animals: Animal[];
  devices: Device[];
  latestData: {[deviceId: number]: TrackingData};
  showPaths: {[animalId: number]: boolean};
  togglePath: (animalId: number) => void;
}

const AnimalDetails: React.FC<AnimalDetailsProps> = ({
  selectedAnimalId,
  animals,
  devices,
  latestData,
  showPaths,
  togglePath
}) => {
  const animal = animals.find(a => a.id === selectedAnimalId);
  if (!animal) return <p>No animal selected</p>;
  
  const device = devices.find(d => d.id === animal.device_id);
  const deviceData = latestData[animal.device_id];
  const color = speciesColors[animal.species] || speciesColors.default;
  const icon = speciesIcons[animal.species] || speciesIcons.default;
  const showPath = showPaths[animal.id] || false;
  
  if (!deviceData) return (
    <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Animal Details</h2>
      <div className="text-center py-4">
        <p className="text-gray-500">No tracking data available for {animal.tag_id}</p>
        <p className="text-sm text-gray-400 mt-1">Connect to the device to start receiving data</p>
      </div>
    </div>
  );
  
  return (
    <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Animal Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 p-4 bg-gray-50 rounded border">
          <div className="flex items-start">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl mr-3"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-medium">{animal.tag_id}</h3>
              <p className="text-gray-500">{animal.species}</p>
              <p className="text-sm mt-1">Sex: {animal.sex}</p>
              <p className="text-sm">Weight: {animal.weight} kg</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="mb-1"><span className="font-medium">Device:</span> {device ? device.serial_number : 'None'}</p>
            <p className="mb-1"><span className="font-medium">Birth Date:</span> {new Date(animal.birth_date).toLocaleDateString()}</p>
            <p className="mb-1"><span className="font-medium">Last Update:</span> {new Date(deviceData.timestamp).toLocaleString()}</p>
          </div>
          
          {animal.notes && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="font-medium mb-1">Notes:</p>
              <p className="text-gray-700 text-sm">{animal.notes}</p>
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Temperature Card */}
            <div className="p-4 bg-gray-50 rounded border">
              <h4 className="font-medium text-gray-700">Temperature</h4>
              <div className="mt-2 text-3xl font-bold">
                {deviceData.temperature.toFixed(1)}°C
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-red-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, deviceData.temperature * 2.5)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Humidity Card */}
            <div className="p-4 bg-gray-50 rounded border">
              <h4 className="font-medium text-gray-700">Humidity</h4>
              <div className="mt-2 text-3xl font-bold">
                {deviceData.humidity.toFixed(1)}%
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, deviceData.humidity)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Location Card */}
            <div className="p-4 bg-gray-50 rounded border md:col-span-2">
              <h4 className="font-medium text-gray-700">Location Data</h4>
              <div className="mt-2 flex flex-wrap gap-4">
                <div>
                  <p className="text-sm text-gray-500">Latitude</p>
                  <p className="font-medium">{deviceData.lat.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Longitude</p>
                  <p className="font-medium">{deviceData.lon.toFixed(6)}</p>
                </div>
                <div className="flex-grow text-right">
                  <button
                    onClick={() => togglePath(animal.id)}
                    className={`px-3 py-1.5 text-sm rounded ${
                      showPath 
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } mr-2`}
                  >
                    {showPath ? 'Hide Path' : 'Show Path'}
                  </button>
                  <a 
                    href={`https://www.google.com/maps?q=${deviceData.lat},${deviceData.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    View on Google Maps
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetails;