"use client";

import React, { useState, useEffect, useRef } from 'react';

// WebSocket URL for ESP32
const ESP32_WS_URL = 'ws://192.168.77.15';

export default function LiveDataPage() {
  const [deviceContent, setDeviceContent] = useState<string>('');
  const [deviceStatus, setDeviceStatus] = useState<string>('Not connected');
  const [lastReceived, setLastReceived] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  
  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);
  
  // Message history for displaying multiple received messages
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const maxHistoryMessages = 10; // Keep only the last 10 messages
  
  // Connect to WebSocket
  const connectWebSocket = () => {
    setDeviceStatus('Connecting...');
    setError(null);
    
    try {
      // Close existing connection if any
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      // Create new WebSocket connection
      const ws = new WebSocket(ESP32_WS_URL);
      wsRef.current = ws;
      
      // Connection opened
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setDeviceStatus('Connected');
        setIsConnected(true);
        setError(null);
      };
      
      // Listen for messages
      ws.onmessage = (event) => {
        console.log('Message from ESP32:', event.data);
        const timestamp = new Date().toLocaleString();
        setLastReceived(timestamp);
        
        // Update device content with the latest message
        setDeviceContent(event.data);
        
        // Add to message history
        setMessageHistory(prev => {
          const newHistory = [...prev, `[${timestamp}] ${event.data}`];
          // Keep only the most recent messages
          return newHistory.slice(-maxHistoryMessages);
        });
      };
      
      // Connection closed
      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event);
        setDeviceStatus('Disconnected');
        setIsConnected(false);
        
        if (event.wasClean) {
          setError(`Connection closed (Code: ${event.code})`);
        } else {
          setError('Connection died unexpectedly');
        }
      };
      
      // Error handling
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setDeviceStatus('Error');
        setIsConnected(false);
        setError('WebSocket connection error');
      };
      
    } catch (err) {
      console.error('Failed to establish WebSocket connection:', err);
      setDeviceStatus('Error');
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsConnected(false);
    }
  };
  
  // Send a message to ESP32 (optional functionality)
  const sendMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
      console.log('Message sent:', message);
      return true;
    } else {
      console.error('WebSocket not connected');
      return false;
    }
  };
  
  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setDeviceStatus('Disconnected');
      setIsConnected(false);
      setError(null);
    }
  };
  
  // Connect on component mount
  useEffect(() => {
    connectWebSocket();
    
    // Cleanup on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ESP32 WebSocket Live Data</h1>
      
      {/* Connection Status Card */}
      <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500' : 
              deviceStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">{deviceStatus}</span>
            {error && <span className="text-sm text-red-500 ml-2">({error})</span>}
          </div>
          
          {lastReceived && (
            <span className="text-sm text-gray-500">
              Last received: {lastReceived}
            </span>
          )}
        </div>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={connectWebSocket}
            disabled={isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {deviceStatus === 'Connecting...' ? 'Connecting...' : 'Connect'}
          </button>
          
          <button
            onClick={disconnectWebSocket}
            disabled={!isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      </div>
      
      {/* Latest Message Display */}
      <div className="bg-white p-4 border rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Latest Message</h2>
        
        <div className="border rounded p-4 bg-gray-50">
          {deviceContent ? (
            <div className="prose max-w-none overflow-auto">
              <pre className="whitespace-pre-wrap">{deviceContent}</pre>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No messages received yet from ESP32.
              {error && (
                <p className="text-red-500 mt-2">
                  Reason: {error}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Message History */}
      <div className="bg-white p-4 border rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Message History</h2>
        
        <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-auto">
          {messageHistory.length > 0 ? (
            <div className="space-y-2">
              {messageHistory.map((msg, index) => (
                <div key={index} className="border-b pb-2 last:border-b-0">
                  <pre className="whitespace-pre-wrap text-sm">{msg}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No message history available.
            </div>
          )}
        </div>
      </div>
      
      {/* Try Sending a Message (optional) */}
      <div className="bg-white p-4 border rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Send Message (Optional)</h2>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            id="message" 
            placeholder="Enter message to send to ESP32..."
            className="flex-1 px-3 py-2 border rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isConnected) {
                const input = e.currentTarget;
                sendMessage(input.value);
                input.value = '';
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('message') as HTMLInputElement;
              if (input.value && isConnected) {
                sendMessage(input.value);
                input.value = '';
              }
            }}
            disabled={!isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
      
      {/* Troubleshooting Info */}
      <div className="mt-6 bg-white p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
        
        <div className="text-sm space-y-2">
          <p><strong>WebSocket URL:</strong> {ESP32_WS_URL}</p>
          <p><strong>Status:</strong> {deviceStatus} {error ? `(${error})` : ''}</p>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Common Issues:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>ESP32 might not be powered on</li>
              <li>ESP32 might be on a different IP address</li>
              <li>ESP32 WebSocket server might not be running</li>
              <li>Browser security policies might block WebSocket connections</li>
              <li>Network connectivity issues between your device and the ESP32</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}