"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { parseESP32Message } from '@/utils/dataProcessing';
import { TrackingData } from '@/utils/types';

interface UseWebSocketProps {
  wsUrl: string;
  onMessage: (data: TrackingData | null) => void;
}

export function useWebSocket({ wsUrl, onMessage }: UseWebSocketProps) {
  const [wsStatus, setWsStatus] = useState('Disconnected');
  const [wsConnected, setWsConnected] = useState(false);
  const [lastReceived, setLastReceived] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Ref to store WebSocket instance
  const wsRef = useRef<WebSocket | null>(null);
  
  // Clean up WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    setWsStatus('Connecting...');
    setError(null);
    
    try {
      // Close existing connection if any
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      
      // Create new connection
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // Connection opened
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setWsStatus('Connected');
        setWsConnected(true);
        setError(null);
      };
      
      // Listen for messages
      ws.onmessage = (event) => {
        console.log('Message from ESP32:', event.data);
        const timestamp = new Date().toLocaleString();
        setLastReceived(timestamp);
        
        // Parse the message
        const parsedData = parseESP32Message(event.data);
        
        // Pass the parsed data to the callback
        onMessage(parsedData);
      };
      
      // Connection closed
      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event);
        setWsStatus('Disconnected');
        setWsConnected(false);
        
        if (event.wasClean) {
          setError(`Connection closed (Code: ${event.code})`);
        } else {
          setError('Connection died unexpectedly');
        }
      };
      
      // Error handling
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsStatus('Error');
        setWsConnected(false);
        setError('WebSocket connection error');
      };
      
    } catch (err: any) {
      console.error('Failed to establish WebSocket connection:', err);
      setWsStatus('Error');
      setError(err.message);
      setWsConnected(false);
    }
  }, [wsUrl, onMessage]);
  
  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWsStatus('Disconnected');
      setWsConnected(false);
      setError(null);
    }
  }, []);
  
  // Return the WebSocket state and methods
  return {
    wsStatus,
    wsConnected,
    lastReceived,
    error,
    connectWebSocket,
    disconnectWebSocket
  };
}