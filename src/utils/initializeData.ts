import { busService } from '../services/busService';
import { FoodItem } from '../types';

// Helper to generate 3 unique food items for a bus
const categories = ['fruits', 'vegetables', 'dairy', 'meat', 'grains', 'cultural'];
const origins = ['Korean', 'Chinese', 'Vietnamese', 'Greek', 'Lebanese', 'Egyptian', 'Indian', 'Mexican', 'Italian', 'Canadian'];
const foodNames = [
  'Kimchi', 'Dim Sum', 'Pho', 'Olive Oil', 'Feta Cheese', 'Hummus', 'Falafel', 'Naan', 'Tandoori Spice', 'Tacos',
  'Pizza', 'Baklava', 'Tomatoes', 'Bananas', 'Mozzarella', 'Dolma', 'Biryani', 'Guacamole', 'Queso', 'Salsa'
];
function generateFoodItemsForBus(busIndex: number): FoodItem[] {
  // Use busIndex to ensure uniqueness
  return Array.from({ length: 3 }, (_, i) => {
    const idx = (busIndex * 3 + i) % foodNames.length;
    return {
      id: `bus${busIndex + 1}-food${i + 1}`,
      name: foodNames[idx],
      category: categories[(busIndex + i) % categories.length],
      culturalOrigin: origins[(busIndex + i) % origins.length],
      quantity: 10 + ((busIndex + 1) * (i + 2)) % 50,
      unit: 'kg',
      price: parseFloat((2.99 + ((busIndex + 1) * (i + 1)) % 20 + i).toFixed(2)),
      inStock: true
    };
  }) as FoodItem[];
}

export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample data...');

    // Check if routes already exist
    const existingRoutes = await busService.getAllRoutes();
    const existingBuses = await busService.getAllBuses();
    
    console.log(`Found ${existingRoutes.length} existing routes and ${existingBuses.length} existing buses`);

    // Only create routes if none exist
    let route1Id: string;
    let route2Id: string;

    if (existingRoutes.length === 0) {
      console.log('Creating sample routes...');
      
      // Create sample routes
      route1Id = await busService.createRoute({
        name: 'Cultural Food Express',
        description: 'Connecting diverse cultural food markets across Calgary',
        culturalFocus: ['Asian', 'Mediterranean', 'Middle Eastern', 'Indian'],
        path: [
          { latitude: 51.0447, longitude: -114.0719 },
          { latitude: 51.0447, longitude: -114.0750 },
          { latitude: 51.0447, longitude: -114.0800 },
          { latitude: 51.0447, longitude: -114.0850 },
          { latitude: 51.0430, longitude: -114.0850 },
          { latitude: 51.0410, longitude: -114.0850 },
          { latitude: 51.0390, longitude: -114.0850 },
          { latitude: 51.0390, longitude: -114.0800 },
          { latitude: 51.0390, longitude: -114.0750 },
          { latitude: 51.0390, longitude: -114.0700 },
          { latitude: 51.0390, longitude: -114.0650 },
          { latitude: 51.0370, longitude: -114.0650 },
          { latitude: 51.0350, longitude: -114.0650 },
          { latitude: 51.0330, longitude: -114.0650 },
          { latitude: 51.0330, longitude: -114.0700 },
          { latitude: 51.0330, longitude: -114.0750 },
          { latitude: 51.0330, longitude: -114.0800 },
          { latitude: 51.0350, longitude: -114.0800 },
          { latitude: 51.0370, longitude: -114.0800 },
          { latitude: 51.0390, longitude: -114.0800 },
          { latitude: 51.0410, longitude: -114.0800 },
          { latitude: 51.0430, longitude: -114.0800 },
          { latitude: 51.0447, longitude: -114.0750 },
          { latitude: 51.0447, longitude: -114.0719 }
        ],
        color: '#3b82f6'
      });

      route2Id = await busService.createRoute({
        name: 'Downtown Fresh Market',
        description: 'Fresh produce and cultural specialties in downtown Calgary',
        culturalFocus: ['Local', 'Organic', 'Artisan'],
        path: [
          { latitude: 51.0447, longitude: -114.0719 },
          { latitude: 51.0467, longitude: -114.0719 },
          { latitude: 51.0467, longitude: -114.0750 },
          { latitude: 51.0467, longitude: -114.0800 },
          { latitude: 51.0487, longitude: -114.0800 },
          { latitude: 51.0507, longitude: -114.0800 },
          { latitude: 51.0527, longitude: -114.0800 },
          { latitude: 51.0527, longitude: -114.0750 },
          { latitude: 51.0527, longitude: -114.0700 },
          { latitude: 51.0527, longitude: -114.0650 },
          { latitude: 51.0527, longitude: -114.0600 },
          { latitude: 51.0507, longitude: -114.0600 },
          { latitude: 51.0487, longitude: -114.0600 },
          { latitude: 51.0467, longitude: -114.0600 },
          { latitude: 51.0467, longitude: -114.0650 },
          { latitude: 51.0467, longitude: -114.0700 },
          { latitude: 51.0467, longitude: -114.0750 },
          { latitude: 51.0447, longitude: -114.0750 },
          { latitude: 51.0447, longitude: -114.0719 }
        ],
        color: '#10b981'
      });

      console.log('Sample routes created:', { route1Id, route2Id });
    } else {
      // Use existing routes
      const culturalRoute = existingRoutes.find(r => r.name === 'Cultural Food Express');
      const downtownRoute = existingRoutes.find(r => r.name === 'Downtown Fresh Market');
      
      if (!culturalRoute || !downtownRoute) {
        console.log('Some expected routes not found, but routes exist. Skipping route creation.');
        return;
      }
      
      route1Id = culturalRoute.id;
      route2Id = downtownRoute.id;
      console.log('Using existing routes:', { route1Id, route2Id });
    }

    // Only create buses if none exist
    if (existingBuses.length === 0) {
      console.log('Creating sample buses...');

      // Status distribution: 0-4 offline, 5-9 maintenance, 10-19 active
      const statuses = [
        ...Array(5).fill('offline'),
        ...Array(5).fill('maintenance'),
        ...Array(10).fill('active')
      ];

      const busIds: string[] = [];
      for (let i = 0; i < 20; i++) {
        const status = statuses[i];
        const driver = `Driver ${i + 1}`;
        const routeId = i % 2 === 0 ? route1Id : route2Id;
        // Get the route object
        const route = (i % 2 === 0)
          ? (existingRoutes.length === 0 ? undefined : existingRoutes.find(r => r.id === route1Id))
          : (existingRoutes.length === 0 ? undefined : existingRoutes.find(r => r.id === route2Id));
        let initialLocation;
        if (route && route.path && route.path.length > 1) {
          // Spread buses evenly along the route path
          const segment = i % route.path.length;
          const nextSegment = (segment + 1) % route.path.length;
          const t = 0.5; // halfway between two points for some spread
          const start = route.path[segment];
          const end = route.path[nextSegment];
          initialLocation = {
            latitude: start.latitude + (end.latitude - start.latitude) * t,
            longitude: start.longitude + (end.longitude - start.longitude) * t,
            heading: Math.atan2(end.longitude - start.longitude, end.latitude - start.latitude) * 180 / Math.PI
          };
        }
        // Create bus
        // eslint-disable-next-line no-await-in-loop
        const busId = await busService.createBus({
          routeId,
          driver,
          status,
          ...(initialLocation ? { initialLocation } : {})
        });
        busIds.push(busId);
        // Add 3 food items
        const foodItems = generateFoodItemsForBus(i);
        for (const food of foodItems) {
          // eslint-disable-next-line no-await-in-loop
          await busService.addItemToBus(busId, food);
        }
      }
      console.log('Sample buses created:', busIds);
    } else {
      console.log('Buses already exist, skipping bus creation');
    }

    console.log('Sample data initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
}; 