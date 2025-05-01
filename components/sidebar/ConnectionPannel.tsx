import React from 'react';

interface ConnectionPanelProps {
  wsStatus: string;
  wsConnected: boolean;
  lastReceived: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  wsStatus,
  wsConnected,
  lastReceived,
  error,
  onConnect,
  onDisconnect
}) => {
  return (
    <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            wsConnected ? 'bg-green-500' : 
            wsStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="font-medium">{wsStatus}</span>
          {error && <span className="text-sm text-red-500 ml-2">({error})</span>}
        </div>
        
        {lastReceived && (
          <span className="text-sm text-gray-500">
            Last received: {lastReceived}
          </span>
        )}
      </div>
      
      <div className="flex gap-3 mb-2">
        <button
          onClick={onConnect}
          disabled={wsConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {wsStatus === 'Connecting...' ? 'Connecting...' : 'Connect'}
        </button>
        
        <button
          onClick={onDisconnect}
          disabled={!wsConnected}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Disconnect
        </button>
      </div>

      <p className="text-sm text-gray-600">
        {wsConnected 
          ? "Connected to device. Receiving live tracking data." 
          : "Connect to start receiving live location and environmental data."}
      </p>
    </div>
  );
};

export default ConnectionPanel;