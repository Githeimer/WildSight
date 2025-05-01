import React from 'react';
import { OverviewStats as OverviewStatsType } from '../utils/types';

interface OverviewStatsProps {
  stats: OverviewStatsType;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {/* Total Animals */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500 mb-1">Total Animals</div>
        <div className="text-2xl font-bold">{stats.totalAnimals}</div>
      </div>
      
      {/* Active Devices */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500 mb-1">Active Devices</div>
        <div className="text-2xl font-bold">{stats.activeDevices}</div>
      </div>
      
      {/* Total Data Points */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500 mb-1">Data Points</div>
        <div className="text-2xl font-bold">{stats.totalDataPoints.toLocaleString()}</div>
      </div>
      
      {/* Average Temperature */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500 mb-1">Avg. Temperature</div>
        <div className="text-2xl font-bold">{stats.avgTemperature.toFixed(1)}°C</div>
      </div>
      
      {/* Average Humidity */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500 mb-1">Avg. Humidity</div>
        <div className="text-2xl font-bold">{stats.avgHumidity.toFixed(1)}%</div>
      </div>
      
      {/* Last Updated */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="text-sm text-gray-500 mb-1">Last Updated</div>
        <div className="text-lg font-medium">
          {stats.lastUpdated 
            ? new Date(stats.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'N/A'
          }
        </div>
        <div className="text-xs text-gray-500">
          {stats.lastUpdated 
            ? new Date(stats.lastUpdated).toLocaleDateString()
            : ''
          }
        </div>
      </div>
    </div>
  );
};

export default OverviewStats;