import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesData, Animal, speciesColors } from '../utils/types';

interface HumidityChartProps {
  data: TimeSeriesData[];
  animalId: number | null;
  animals: Animal[];
}

const HumidityChart: React.FC<HumidityChartProps> = ({ data, animalId, animals }) => {
  // Filter data based on selected animal
  const filteredData = animalId 
    ? data.filter(series => series.animalId === animalId)
    : data;
  
  // Map to format expected by Recharts
  const getChartData = () => {
    // If no data or filtered data is empty
    if (filteredData.length === 0) {
      return [];
    }
    
    // Get all unique timestamps across all series
    const allTimestamps = new Set<string>();
    filteredData.forEach(series => {
      series.data.forEach(point => {
        allTimestamps.add(point.timestamp);
      });
    });
    
    // Sort timestamps
    const sortedTimestamps = Array.from(allTimestamps).sort();
    
    // Create a map of animal ID to tag_id
    const animalIdToTag: {[key: number]: string} = {};
    animals.forEach(animal => {
      animalIdToTag[animal.id] = animal.tag_id;
    });
    
    // Create data points for each timestamp with all series values
    return sortedTimestamps.map(timestamp => {
      const dataPoint: any = { date: timestamp };
      
      filteredData.forEach(series => {
        const matchingPoint = series.data.find(point => point.timestamp === timestamp);
        const animalTag = animalIdToTag[series.animalId] || `Animal ${series.animalId}`;
        
        dataPoint[animalTag] = matchingPoint ? matchingPoint.value : null;
      });
      
      return dataPoint;
    });
  };
  
  const chartData = getChartData();
  
  // Find animal object by ID
  const getAnimalById = (id: number) => {
    return animals.find(animal => animal.id === id);
  };
  
  // Helper to format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };
  
  // If no data to display
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
        <p className="text-gray-500">No humidity data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: 'Humidity (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12 }
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: any) => [`${value}%`, '']}
            labelFormatter={(label) => `Date: ${formatDate(label.toString())}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          
          {filteredData.map(series => {
            const animal = getAnimalById(series.animalId);
            const color = animal 
              ? speciesColors[animal.species] || speciesColors.default
              : speciesColors.default;
            const animalTag = animal ? animal.tag_id : `Animal ${series.animalId}`;
            
            return (
              <Line
                key={series.animalId}
                type="monotone"
                dataKey={animalTag}
                stroke={color}
                activeDot={{ r: 6 }}
                strokeWidth={2}
                connectNulls
                strokeDasharray="3 3"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HumidityChart;