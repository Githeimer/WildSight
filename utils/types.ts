// Interface definitions for the tracking system

// Device information
export interface Device {
    id: number;
    serial_number: string;
    installation_date: string;
    last_connected: string;
    updated_at: string;
    isActive: boolean;
  }
  
  // Animal information
  export interface Animal {
    id: number;
    tag_id: string;
    species: string;
    birth_date: string;
    sex: string;
    weight: number;
    notes: string;
    updated_at: string;
    device_id: number;
  }
  
  // Tracking data from devices
  export interface TrackingData {
    id: number;
    device_id: number;
    timestamp: string;
    temperature: number;
    humidity: number;
    lat: number;
    lon: number;
  }
  
  // Colors for different animal species
  export const speciesColors: {[key: string]: string} = {
    'Lion': '#E53935',
    'Elephant': '#3949AB',
    'Zebra': '#43A047',
    'Giraffe': '#FB8C00',
    'Rhino': '#5D4037',
    'Buffalo': '#546E7A',
    'Leopard': '#F57F17',
    'Cheetah': '#FDD835',
    'Wolf': '#455A64',
    'Fox': '#D84315',
    'Bear': '#6D4C41',
    'default': '#607D8B'
  };
  
  // Icons for different animal species
  export const speciesIcons: {[key: string]: string} = {
    'Lion': '🦁',
    'Elephant': '🐘',
    'Zebra': '🦓',
    'Giraffe': '🦒',
    'Rhino': '🦏',
    'Buffalo': '🐃',
    'Leopard': '🐆',
    'Cheetah': '🐆',
    'Wolf': '🐺',
    'Fox': '🦊',
    'Bear': '🐻',
    'default': '🐾'
  };