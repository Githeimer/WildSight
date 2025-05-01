import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white p-8 rounded-lg border shadow-sm mb-6 text-center">
        <div className="animate-spin inline-block w-10 h-10 border-4 border-current border-t-transparent text-blue-500 rounded-full mb-4"></div>
        <p className="text-gray-700 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;