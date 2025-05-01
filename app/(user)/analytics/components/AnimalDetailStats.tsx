import React from 'react';
import { Animal, Device, AnimalStats, speciesColors, speciesIcons } from '../utils/types';

interface AnimalDetailsStatsProps {
  animalId: number;
  animals: Animal[];
  devices: Device[];
  stats: AnimalStats;
}

const AnimalDetailsStats: React.FC<AnimalDetailsStatsProps> = ({
  animalId,
  animals,
  devices,
  stats
}) => {
  const animal = animals.find(a => a.id === animalId);
  if (!animal) return null;
  
  const device = devices.find(d => d.id === animal.device_id);
  const color = speciesColors[animal.species] || speciesColors.default;
  const icon = speciesIcons[animal.species] || speciesIcons.default;
  
  // Create default values for stats in case they're missing
  const defaultStats = {
    totalDataPoints: stats?.totalDataPoints || 0,
    avgTemperature: stats?.avgTemperature || 0,
    avgHumidity: stats?.avgHumidity || 0,
    distanceTraveled: stats?.distanceTraveled || 0,
    maxSpeed: stats?.maxSpeed || 0,
    avgSpeed: stats?.avgSpeed || 0,
    maxTemperature: stats?.maxTemperature || 0,
    minTemperature: stats?.minTemperature || 0,
    maxHumidity: stats?.maxHumidity || 0,
    minHumidity: stats?.minHumidity || 0,
    timeOfDayDistribution: stats?.timeOfDayDistribution || {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    }
  };
  
  // Extract time of day distribution with defaults
  const timeDistribution = {
    morning: defaultStats.timeOfDayDistribution?.morning || 0,
    afternoon: defaultStats.timeOfDayDistribution?.afternoon || 0,
    evening: defaultStats.timeOfDayDistribution?.evening || 0,
    night: defaultStats.timeOfDayDistribution?.night || 0
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex items-center mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl mr-3"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{animal.tag_id} - Detailed Analysis</h3>
          <p className="text-gray-500">{animal.species} ({animal.sex}) - {animal.weight}kg</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Movement Statistics */}
        <div className="md:col-span-1 space-y-4">
          <h4 className="font-medium border-b pb-2">Movement Statistics</h4>
          
          <div>
            <div className="text-sm text-gray-500">Total Distance Traveled</div>
            <div className="text-xl font-bold">{defaultStats.distanceTraveled} km</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Average Speed</div>
            <div className="text-xl font-bold">{defaultStats.avgSpeed} km/h</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Maximum Speed</div>
            <div className="text-xl font-bold">{defaultStats.maxSpeed} km/h</div>
          </div>
          
          <div className="pt-2">
            <div className="text-sm text-gray-500 mb-2">Activity Distribution</div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-xs text-gray-500">Morning</div>
                <div className="bg-blue-100 rounded-full h-20 relative flex items-center justify-center">
                  <div 
                    className="absolute bottom-0 bg-blue-500 rounded-full w-full"
                    style={{ height: `${timeDistribution.morning}%` }}
                  ></div>
                  <span className="relative z-10 font-medium">{timeDistribution.morning}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Afternoon</div>
                <div className="bg-yellow-100 rounded-full h-20 relative flex items-center justify-center">
                  <div 
                    className="absolute bottom-0 bg-yellow-500 rounded-full w-full"
                    style={{ height: `${timeDistribution.afternoon}%` }}
                  ></div>
                  <span className="relative z-10 font-medium">{timeDistribution.afternoon}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Evening</div>
                <div className="bg-orange-100 rounded-full h-20 relative flex items-center justify-center">
                  <div 
                    className="absolute bottom-0 bg-orange-500 rounded-full w-full"
                    style={{ height: `${timeDistribution.evening}%` }}
                  ></div>
                  <span className="relative z-10 font-medium">{timeDistribution.evening}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Night</div>
                <div className="bg-indigo-100 rounded-full h-20 relative flex items-center justify-center">
                  <div 
                    className="absolute bottom-0 bg-indigo-500 rounded-full w-full"
                    style={{ height: `${timeDistribution.night}%` }}
                  ></div>
                  <span className="relative z-10 font-medium">{timeDistribution.night}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Environmental Data */}
        <div className="md:col-span-1 space-y-4">
          <h4 className="font-medium border-b pb-2">Environmental Data</h4>
          
          <div>
            <div className="text-sm text-gray-500">Temperature Range</div>
            <div className="bg-gray-100 rounded-full h-4 mt-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-red-500 h-full rounded-full"
                style={{ 
                  width: '100%',
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span>{defaultStats.minTemperature}°C</span>
              <span>{defaultStats.maxTemperature}°C</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Average Temperature</div>
            <div className="text-xl font-bold">{defaultStats.avgTemperature}°C</div>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-gray-500">Humidity Range</div>
            <div className="bg-gray-100 rounded-full h-4 mt-1 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-300 to-blue-600 h-full rounded-full"
                style={{ 
                  width: '100%',
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <span>{defaultStats.minHumidity}%</span>
              <span>{defaultStats.maxHumidity}%</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Average Humidity</div>
            <div className="text-xl font-bold">{defaultStats.avgHumidity}%</div>
          </div>
        </div>
        
        {/* Device and Data */}
        <div className="md:col-span-1 space-y-4">
          <h4 className="font-medium border-b pb-2">Tracking Details</h4>
          
          <div>
            <div className="text-sm text-gray-500">Device</div>
            <div className="text-lg font-medium">{device ? device.serial_number : 'N/A'}</div>
            <div className="text-xs text-gray-500">
              {device 
                ? `Installed: ${new Date(device.installation_date).toLocaleDateString()}`
                : 'No device assigned'
              }
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Data Points Collected</div>
            <div className="text-xl font-bold">{defaultStats.totalDataPoints.toLocaleString()}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Birth Date</div>
            <div className="text-lg font-medium">
              {new Date(animal.birth_date).toLocaleDateString()}
            </div>
          </div>
          
          {animal.notes && (
            <div>
              <div className="text-sm text-gray-500">Notes</div>
              <div className="text-sm p-2 bg-gray-50 rounded border mt-1">
                {animal.notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalDetailsStats;