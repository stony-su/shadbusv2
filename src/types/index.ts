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

export interface BusRoute {
  id: string;
  name: string;
  description: string;
  culturalFocus: string[];
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