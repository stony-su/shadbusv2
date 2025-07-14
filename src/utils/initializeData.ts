import { busService } from '../services/busService';

export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample data...');

    // Create sample routes
    const route1Id = await busService.createRoute({
      name: 'Cultural Food Express',
      description: 'Connecting diverse cultural food markets across Calgary',
      culturalFocus: ['Asian', 'Mediterranean', 'Middle Eastern', 'Indian']
    });

    const route2Id = await busService.createRoute({
      name: 'Downtown Fresh Market',
      description: 'Fresh produce and cultural specialties in downtown Calgary',
      culturalFocus: ['Local', 'Organic', 'Artisan']
    });

    console.log('Sample routes created:', { route1Id, route2Id });

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

    console.log('Sample data initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing sample data:', error);
    throw error;
  }
}; 