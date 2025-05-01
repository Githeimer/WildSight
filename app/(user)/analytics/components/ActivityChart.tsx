import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeSeriesData, Animal, speciesColors } from '../utils/types';

interface ActivityChartProps {
  data: TimeSeriesData[];
  animalId: number | null;
  animals: Animal[];
}

const ActivityChart: React.FC<ActivityChartProps> = ({ data, animalId, animals }) => {
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
    
    // We need to create 24 data points (0-23 hours)
    const hours = Array.from({ length: 24 }, (_, i) => i.toString());
    
    // Create a map of animal ID to tag_id
    const animalIdToTag: {[key: number]: string} = {};
    animals.forEach(animal => {
      animalIdToTag[animal.id] = animal.tag_id;
    });
    
    // Create data points for each hour with all series values
    return hours.map(hour => {
      const dataPoint: any = { hour: parseInt(hour) };
      
      filteredData.forEach(series => {
        const matchingPoint = series.data.find(point => point.timestamp === hour);
        const animalTag = animalIdToTag[series.animalId] || `Animal ${series.animalId}`;
        
        dataPoint[animalTag] = matchingPoint ? matchingPoint.value : 0;
      });
      
      return dataPoint;
    });
  };
  
  const chartData = getChartData();
  
  // Find animal object by ID
  const getAnimalById = (id: number) => {
    return animals.find(animal => animal.id === id);
  };
  
  // Helper to format hour for display
  const formatHour = (hour: number) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}${ampm}`;
  };
  
  // If no data to display
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
        <p className="text-gray-500">No activity data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            tickFormatter={formatHour}
            tick={{ fontSize: 12 }}
            label={{
              value: 'Hour of Day',
              position: 'insideBottom',
              offset: -15,
              style: { textAnchor: 'middle', fontSize: 12 }
            }}
          />
          <YAxis 
            label={{ 
              value: 'Activity (data points)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12 }
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: any) => [`${value} data points`, '']}
            labelFormatter={(label) => `Time: ${formatHour(parseInt(label.toString()))}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          
          {filteredData.map(series => {
            const animal = getAnimalById(series.animalId);
            const color = animal 
              ? speciesColors[animal.species] || speciesColors.default
              : speciesColors.default;
            const animalTag = animal ? animal.tag_id : `Animal ${series.animalId}`;
            
            return (
              <Bar
                key={series.animalId}
                dataKey={animalTag}
                fill={color}
                radius={[4, 4, 0, 0]}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;