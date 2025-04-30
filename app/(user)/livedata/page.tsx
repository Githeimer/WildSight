"use client";

import React, { useState, useEffect } from 'react';

const ESP32_URL = 'http://192.168.77.15/';

export default function LiveDataPage() {
  const [deviceContent, setDeviceContent] = useState<string>('');
  const [deviceStatus, setDeviceStatus] = useState<string>('Not connected');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchFromESP32 = async () => {
    setLoading(true);
    setDeviceStatus('Connecting...');
    
    try {
      console.log(`Attempting to fetch from: ${ESP32_URL}`);
      
      let response;
      try {
        // Direct fetch
        response = await fetch(ESP32_URL);
      } catch (directError) {
        // Try proxy if direct fails
        console.log("Direct fetch failed, trying proxy");
        response = await fetch(`/api/proxy?url=${encodeURIComponent(ESP32_URL)}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const text = await response.text();
      setDeviceContent(text);
      setDeviceStatus('Connected');
      setLastFetched(new Date().toLocaleString());
      
    } catch (error) {
      console.error("Fetch error:", error);
      setDeviceStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDeviceContent('');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchFromESP32();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">ESP32 Live Data</h1>
      
      <div className="mb-6 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              deviceStatus === 'Connected' ? 'bg-green-500' : 
              deviceStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="font-medium">{deviceStatus}</span>
          </div>
          
          {lastFetched && (
            <span className="text-sm text-gray-500">
              Last updated: {lastFetched}
            </span>
          )}
        </div>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={fetchFromESP32}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          
          <button
            onClick={() => {
              // Set up auto-refresh - every 10 seconds
              const intervalId = setInterval(fetchFromESP32, 10000);
              alert('Auto-refresh enabled (every 10 seconds). Refresh the page to stop.');
              
              // Store the interval ID so it can be cleared if needed
              window.localStorage.setItem('autoRefreshId', intervalId.toString());
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Enable Auto-Refresh
          </button>
        </div>
      </div>
      
      {/* ESP32 Content Display */}
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">ESP32 Content</h2>
        
        <div className="border rounded p-4 bg-gray-50">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p>Loading content from ESP32...</p>
            </div>
          ) : deviceContent ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: deviceContent }} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              No content available from ESP32.
            </div>
          )}
        </div>
      </div>
      
      {/* Raw HTML Display */}
      <div className="mt-6 bg-white p-4 border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Raw HTML</h2>
        
        <pre className="bg-gray-50 p-4 rounded border overflow-auto max-h-96 text-sm">
          {deviceContent || 'No content available'}
        </pre>
      </div>
    </div>
  );
}