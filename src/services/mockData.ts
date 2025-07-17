import { BusDetails, BusLocation, BusRoute, FoodItem, BusInventory, RoutePath, Hub } from '../types';

// Calgary coordinates
const CALGARY_CENTER = { lat: 51.0447, lng: -114.0719 };

// Sample cultural foods
const culturalFoods = {
  middleEastern: ['Hummus', 'Falafel', 'Shawarma', 'Baklava', 'Tabouleh'],
  asian: ['Kimchi', 'Sushi', 'Dim Sum', 'Pho', 'Pad Thai'],
  mediterranean: ['Olive Oil', 'Feta Cheese', 'Tzatziki', 'Dolma', 'Baklava'],
  indian: ['Curry', 'Naan', 'Tandoori', 'Biryani', 'Chutney'],
  mexican: ['Tacos', 'Guacamole', 'Queso', 'Tortillas', 'Salsa'],
  italian: ['Pasta', 'Pizza', 'Prosciutto', 'Mozzarella', 'Balsamic']
};

// Route paths following Calgary roads
const route1Path: RoutePath[] = [
  // Starting from downtown Calgary
  { latitude: 51.0447, longitude: -114.0719 },
  // Following 7th Avenue SW
  { latitude: 51.0447, longitude: -114.0750 },
  { latitude: 51.0447, longitude: -114.0800 },
  { latitude: 51.0447, longitude: -114.0850 },
  // Turning onto 14th Street SW
  { latitude: 51.0430, longitude: -114.0850 },
  { latitude: 51.0410, longitude: -114.0850 },
  { latitude: 51.0390, longitude: -114.0850 },
  // Following 17th Avenue SW
  { latitude: 51.0390, longitude: -114.0800 },
  { latitude: 51.0390, longitude: -114.0750 },
  { latitude: 51.0390, longitude: -114.0700 },
  { latitude: 51.0390, longitude: -114.0650 },
  // Turning onto Macleod Trail
  { latitude: 51.0370, longitude: -114.0650 },
  { latitude: 51.0350, longitude: -114.0650 },
  { latitude: 51.0330, longitude: -114.0650 },
  // Following 4th Street SW
  { latitude: 51.0330, longitude: -114.0700 },
  { latitude: 51.0330, longitude: -114.0750 },
  { latitude: 51.0330, longitude: -114.0800 },
  // Back to downtown
  { latitude: 51.0350, longitude: -114.0800 },
  { latitude: 51.0370, longitude: -114.0800 },
  { latitude: 51.0390, longitude: -114.0800 },
  { latitude: 51.0410, longitude: -114.0800 },
  { latitude: 51.0430, longitude: -114.0800 },
  { latitude: 51.0447, longitude: -114.0750 },
  { latitude: 51.0447, longitude: -114.0719 }
];

const route2Path: RoutePath[] = [
  // Starting from downtown Calgary
  { latitude: 51.0447, longitude: -114.0719 },
  // Following 8th Avenue SW
  { latitude: 51.0467, longitude: -114.0719 },
  { latitude: 51.0467, longitude: -114.0750 },
  { latitude: 51.0467, longitude: -114.0800 },
  // Following 11th Street SW
  { latitude: 51.0487, longitude: -114.0800 },
  { latitude: 51.0507, longitude: -114.0800 },
  { latitude: 51.0527, longitude: -114.0800 },
  // Following 16th Avenue NW
  { latitude: 51.0527, longitude: -114.0750 },
  { latitude: 51.0527, longitude: -114.0700 },
  { latitude: 51.0527, longitude: -114.0650 },
  { latitude: 51.0527, longitude: -114.0600 },
  // Following 19th Street NW
  { latitude: 51.0507, longitude: -114.0600 },
  { latitude: 51.0487, longitude: -114.0600 },
  { latitude: 51.0467, longitude: -114.0600 },
  // Following 12th Avenue NW
  { latitude: 51.0467, longitude: -114.0650 },
  { latitude: 51.0467, longitude: -114.0700 },
  { latitude: 51.0467, longitude: -114.0750 },
  // Back to downtown
  { latitude: 51.0447, longitude: -114.0750 },
  { latitude: 51.0447, longitude: -114.0719 }
];

// Sample bus routes
export const busRoutes: BusRoute[] = [
  {
    id: 'route-1',
    name: 'Cultural Food Express',
    description: 'Connecting diverse cultural food markets across Calgary',
    culturalFocus: ['Asian', 'Mediterranean', 'Middle Eastern', 'Indian'],
    path: route1Path,
    color: '#3b82f6' // Blue
  },
  {
    id: 'route-2',
    name: 'Downtown Fresh Market',
    description: 'Fresh produce and cultural specialties in downtown Calgary',
    culturalFocus: ['Local', 'Organic', 'Artisan'],
    path: route2Path,
    color: '#10b981' // Green
  }
];

// Sample food items
const generateFoodItems = (culturalFocus: string[]): FoodItem[] => {
  const items: FoodItem[] = [];
  
  culturalFocus.forEach(focus => {
    switch (focus.toLowerCase()) {
      case 'asian':
        items.push(
          { id: 'food-1', name: 'Fresh Kimchi', category: 'cultural', culturalOrigin: 'Korean', quantity: 50, unit: 'jars', price: 8.99, inStock: true },
          { id: 'food-2', name: 'Dim Sum Set', category: 'cultural', culturalOrigin: 'Chinese', quantity: 20, unit: 'sets', price: 15.99, inStock: true },
          { id: 'food-3', name: 'Pho Broth', category: 'cultural', culturalOrigin: 'Vietnamese', quantity: 30, unit: 'liters', price: 12.99, inStock: true }
        );
        break;
      case 'mediterranean':
        items.push(
          { id: 'food-4', name: 'Extra Virgin Olive Oil', category: 'cultural', culturalOrigin: 'Greek', quantity: 40, unit: 'bottles', price: 18.99, inStock: true },
          { id: 'food-5', name: 'Feta Cheese', category: 'dairy', culturalOrigin: 'Greek', quantity: 25, unit: 'kg', price: 22.99, inStock: true }
        );
        break;
      case 'middle eastern':
        items.push(
          { id: 'food-6', name: 'Fresh Hummus', category: 'cultural', culturalOrigin: 'Lebanese', quantity: 35, unit: 'containers', price: 6.99, inStock: true },
          { id: 'food-7', name: 'Falafel Mix', category: 'cultural', culturalOrigin: 'Egyptian', quantity: 15, unit: 'kg', price: 9.99, inStock: true }
        );
        break;
      case 'indian':
        items.push(
          { id: 'food-8', name: 'Fresh Naan', category: 'grains', culturalOrigin: 'Indian', quantity: 60, unit: 'pieces', price: 3.99, inStock: true },
          { id: 'food-9', name: 'Tandoori Spice Mix', category: 'cultural', culturalOrigin: 'Indian', quantity: 20, unit: 'packets', price: 7.99, inStock: true }
        );
        break;
      default:
        items.push(
          { id: 'food-10', name: 'Fresh Tomatoes', category: 'vegetables', quantity: 100, unit: 'kg', price: 4.99, inStock: true },
          { id: 'food-11', name: 'Organic Bananas', category: 'fruits', quantity: 80, unit: 'kg', price: 3.99, inStock: true }
        );
    }
  });
  
  return items;
};

// Generate bus details
export const generateBusDetails = (): BusDetails[] => {
  return busRoutes.map((route, index) => {
    const currentLocation: BusLocation = {
      id: `bus-${index + 1}`,
      latitude: CALGARY_CENTER.lat + (Math.random() - 0.5) * 0.01,
      longitude: CALGARY_CENTER.lng + (Math.random() - 0.5) * 0.01,
      estimatedArrival: Math.floor(Math.random() * 30) + 5,
      currentSpeed: Math.floor(Math.random() * 20) + 30,
      heading: Math.floor(Math.random() * 360)
    };

    const inventory: BusInventory = {
      busId: `bus-${index + 1}`,
      items: generateFoodItems(route.culturalFocus),
      totalItems: generateFoodItems(route.culturalFocus).length,
      lastUpdated: new Date()
    };

    return {
      id: `bus-${index + 1}`,
      route,
      location: currentLocation,
      inventory,
      driver: `Driver ${index + 1}`,
      status: 'active' as const,
      lastUpdate: new Date()
    };
  });
};

// Update bus locations (simulate movement)
export const updateBusLocations = (buses: BusDetails[]): BusDetails[] => {
  return buses.map(bus => ({
    ...bus,
    location: {
      ...bus.location,
      latitude: bus.location.latitude + (Math.random() - 0.5) * 0.0001,
      longitude: bus.location.longitude + (Math.random() - 0.5) * 0.0001,
      estimatedArrival: Math.max(1, bus.location.estimatedArrival - 1),
      currentSpeed: Math.floor(Math.random() * 20) + 30,
      heading: (bus.location.heading + Math.random() * 10) % 360
    },
    lastUpdate: new Date()
  }));
}; 

export const mockHubs: Hub[] = [
  {
    id: 'hub-1',
    name: 'North Community Center Shop',
    location: { latitude: 51.0600, longitude: -114.0700 },
    stock: [
      { id: 'h1-1', name: 'Canned Soup', category: 'cultural', quantity: 40, unit: 'cans', price: 2.99, inStock: true },
      { id: 'h1-2', name: 'Bread Loaf', category: 'grains', quantity: 20, unit: 'loaves', price: 3.49, inStock: true }
    ],
    openTime: '09:00',
    closeTime: '17:00'
  },
  {
    id: 'hub-2',
    name: 'South Community Center Shop',
    location: { latitude: 51.0300, longitude: -114.0710 },
    stock: [
      { id: 'h2-1', name: 'Milk', category: 'dairy', quantity: 30, unit: 'liters', price: 4.29, inStock: true },
      { id: 'h2-2', name: 'Eggs', category: 'cultural', quantity: 50, unit: 'dozen', price: 3.99, inStock: true }
    ],
    openTime: '10:00',
    closeTime: '18:00'
  },
  {
    id: 'hub-3',
    name: 'East Community Center Shop',
    location: { latitude: 51.0450, longitude: -114.0500 },
    stock: [
      { id: 'h3-1', name: 'Rice', category: 'grains', quantity: 100, unit: 'kg', price: 1.99, inStock: true },
      { id: 'h3-2', name: 'Beans', category: 'cultural', quantity: 60, unit: 'kg', price: 2.49, inStock: true }
    ],
    openTime: '08:30',
    closeTime: '16:30'
  }
]; 