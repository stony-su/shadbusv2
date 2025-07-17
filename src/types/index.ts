export interface BusLocation {
  id: string;
  latitude: number;
  longitude: number;
  estimatedArrival: number; // minutes
  currentSpeed: number; // km/h
  heading: number; // degrees
}

export interface FoodItem {
  id: string;
  name: string;
  category: 'fruits' | 'vegetables' | 'dairy' | 'meat' | 'grains' | 'cultural';
  culturalOrigin?: string;
  quantity: number;
  unit: string;
  price: number;
  inStock: boolean;
}

export interface BusInventory {
  busId: string;
  items: FoodItem[];
  totalItems: number;
  lastUpdated: Date;
}

export interface RoutePath {
  latitude: number;
  longitude: number;
}

export interface BusRoute {
  id: string;
  name: string;
  description: string;
  culturalFocus: string[];
  path: RoutePath[]; // Array of coordinates that define the route path
  color: string; // Color for displaying the route on the map
}

export interface BusDetails {
  id: string;
  route: BusRoute;
  location: BusLocation;
  inventory: BusInventory;
  driver: string;
  status: 'active' | 'maintenance' | 'offline';
  lastUpdate: Date;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Hub {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  stock: FoodItem[];
  openTime: string; // e.g. '09:00'
  closeTime: string; // e.g. '17:00'
} 