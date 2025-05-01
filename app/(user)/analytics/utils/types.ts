// Reusing types from the livetracking module
export interface Device {
    id: number;
    serial_number: string;
    installation_date: string;
    last_connected: string;
    updated_at: string;
    isActive: boolean;
  }
  
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
  
  export interface TrackingData {
    id: number;
    device_id: number;
    timestamp: string;
    temperature: number;
    humidity: number;
    lat: number;
    lon: number;
  }
  
  // Analytics-specific types
  export interface TimeSeriesDataPoint {
    timestamp: string;
    value: number;
    animalId?: number;
  }
  
  export interface TimeSeriesData {
    animalId: number;
    data: TimeSeriesDataPoint[];
  }
  
  export interface MovementDataPoint {
    timestamp: string;
    lat: number;
    lon: number;
  }
  
  export interface AnimalStats {
    totalDataPoints: number;
    avgTemperature: number;
    avgHumidity: number;
    distanceTraveled: number;  // in kilometers
    maxSpeed: number;          // in km/h
    avgSpeed: number;          // in km/h
    maxTemperature: number;
    minTemperature: number;
    maxHumidity: number;
    minHumidity: number;
    timeOfDayDistribution: {
      morning: number;    // 6am-12pm (percentage)
      afternoon: number;  // 12pm-6pm (percentage)
      evening: number;    // 6pm-12am (percentage)
      night: number;      // 12am-6am (percentage)
    };
  }
  
  export interface AnalyticsData {
    temperatureData: TimeSeriesData[];
    humidityData: TimeSeriesData[];
    movementData: {[animalId: number]: MovementDataPoint[]};
    activityData: TimeSeriesData[];
    animalStats: {[animalId: number]: AnimalStats};
  }
  
  export interface OverviewStats {
    totalAnimals: number;
    activeDevices: number;
    totalDataPoints: number;
    avgTemperature: number;
    avgHumidity: number;
    lastUpdated: Date | null;
  }
  
  // Activity types
  export interface ActivityDataPoint {
    hour: number;
    value: number;
    animalId: number;
  }
  
  // Colors for different animal species (reused from livetracking)
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


  export const speciesIcons: {[key: string]: string} = {
    // Large mammals
    'Lion': '🦁',
    'Elephant': '🐘',
    'Zebra': '🦓',
    'Giraffe': '🦒',
    'Rhino': '🦏',
    'Buffalo': '🦬',
    'Leopard': '🐆',
    'Cheetah': '🐆', // Same as leopard, no specific cheetah emoji
    'Wolf': '🐺',
    'Fox': '🦊',
    'Bear': '🐻',
    'Tiger': '🐅',
    'Panda': '🐼',
    'Gorilla': '🦍',
    'Hippo': '🦛',
    'Hyena': '🦓', // No hyena emoji, using zebra as placeholder
    
    // Small mammals
    'Deer': '🦌',
    'Rabbit': '🐇',
    'Squirrel': '🐿️',
    'Mouse': '🐁',
    'Rat': '🐀',
    'Hedgehog': '🦔',
    'Badger': '🦡',
    'Raccoon': '🦝',
    'Weasel': '🦦', // Using otter emoji
    'Mongoose': '🐹', // Using hamster emoji
    
    // Primates
    'Monkey': '🐒',
    'Baboon': '🐒',
    'Chimp': '🐵',
    'Lemur': '🐒',
    
    // Marine mammals
    'Dolphin': '🐬',
    'Whale': '🐋',
    'Seal': '🦭',
    'Otter': '🦦',
    'Walrus': '🦭',
    
    // Birds
    'Eagle': '🦅',
    'Hawk': '🦅',
    'Owl': '🦉',
    'Penguin': '🐧',
    'Duck': '🦆',
    'Swan': '🦢',
    'Parrot': '🦜',
    'Flamingo': '🦩',
    'Peacock': '🦚',
    
    // Reptiles
    'Crocodile': '🐊',
    'Snake': '🐍',
    'Turtle': '🐢',
    'Lizard': '🦎',
    
    // Amphibians
    'Frog': '🐸',
    
    // Insects/Invertebrates
    'Butterfly': '🦋',
    'Spider': '🕷️',
    'Scorpion': '🦂',
    'Snail': '🐌',
    
    // Fish
    'Fish': '🐟',
    'Shark': '🦈',
    
    // Farm animals
    'Cow': '🐄',
    'Pig': '🐖',
    'Sheep': '🐑',
    'Goat': '🐐',
    'Horse': '🐎',
    'Chicken': '🐓',
    
    // Default icon
    'default': '🐾'
  };