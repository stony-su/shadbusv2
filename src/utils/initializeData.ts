import { busService } from '../services/busService';

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
      
      // Create sample buses
      const bus1Id = await busService.createBus({
        routeId: route1Id,
        driver: 'Sarah Johnson',
        status: 'active'
      });

      const bus2Id = await busService.createBus({
        routeId: route2Id,
        driver: 'Mike Chen',
        status: 'active'
      });

      console.log('Sample buses created:', { bus1Id, bus2Id });
    } else {
      console.log('Buses already exist, skipping bus creation');
    }

    console.log('Sample data initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
}; 