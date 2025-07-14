import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { BusDetails, BusRoute, BusLocation, FoodItem, BusInventory } from '../types';

export interface CreateBusRequest {
  routeId: string;
  driver: string;
  status?: 'active' | 'maintenance' | 'offline';
}

export interface CreateRouteRequest {
  name: string;
  description: string;
  culturalFocus: string[];
}

export interface UpdateStockRequest {
  busId: string;
  items: {
    id: string;
    quantity: number;
    inStock: boolean;
  }[];
}

class BusService {
  // Bus Management
  async createBus(request: CreateBusRequest): Promise<string> {
    try {
      // Get the route first
      const routeDoc = await getDoc(doc(db, 'routes', request.routeId));
      if (!routeDoc.exists()) {
        throw new Error('Route not found');
      }

      const route = routeDoc.data() as BusRoute;

      // Create initial location
      const location: BusLocation = {
        id: '', // Will be set by Firestore
        latitude: 51.0447 + (Math.random() - 0.5) * 0.01, // Random position around Calgary
        longitude: -114.0719 + (Math.random() - 0.5) * 0.01,
        estimatedArrival: Math.floor(Math.random() * 30) + 5,
        currentSpeed: Math.floor(Math.random() * 20) + 30,
        heading: Math.floor(Math.random() * 360)
      };

      // Create initial inventory
      const inventory: BusInventory = {
        busId: '', // Will be set by Firestore
        items: [],
        totalItems: 0,
        lastUpdated: new Date()
      };

      // Create bus document
      const busData = {
        route: route,
        location: location,
        inventory: inventory,
        driver: request.driver,
        status: request.status || 'active',
        lastUpdate: new Date(),
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'buses'), busData);
      
      // Update the location and inventory with the bus ID
      await updateDoc(docRef, {
        'location.id': docRef.id,
        'inventory.busId': docRef.id
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating bus:', error);
      throw error;
    }
  }

  async updateBusLocation(busId: string, location: Partial<BusLocation>): Promise<void> {
    try {
      const busRef = doc(db, 'buses', busId);
      await updateDoc(busRef, {
        location: { ...location },
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating bus location:', error);
      throw error;
    }
  }

  async updateBusStatus(busId: string, status: 'active' | 'maintenance' | 'offline'): Promise<void> {
    try {
      const busRef = doc(db, 'buses', busId);
      await updateDoc(busRef, {
        status,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating bus status:', error);
      throw error;
    }
  }

  async deleteBus(busId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'buses', busId));
    } catch (error) {
      console.error('Error deleting bus:', error);
      throw error;
    }
  }

  // Route Management
  async createRoute(request: CreateRouteRequest): Promise<string> {
    try {
      const routeData: BusRoute = {
        id: '', // Will be set by Firestore
        name: request.name,
        description: request.description,
        culturalFocus: request.culturalFocus
      };

      const docRef = await addDoc(collection(db, 'routes'), routeData);
      
      // Update the route with its ID
      await updateDoc(docRef, {
        id: docRef.id
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating route:', error);
      throw error;
    }
  }

  async updateRoute(routeId: string, updates: Partial<BusRoute>): Promise<void> {
    try {
      const routeRef = doc(db, 'routes', routeId);
      await updateDoc(routeRef, {
        ...updates,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating route:', error);
      throw error;
    }
  }

  async deleteRoute(routeId: string): Promise<void> {
    try {
      // Check if any buses are using this route
      const busesQuery = query(collection(db, 'buses'), where('route.id', '==', routeId));
      const busesSnapshot = await getDocs(busesQuery);
      
      if (!busesSnapshot.empty) {
        throw new Error('Cannot delete route: buses are currently using this route');
      }

      await deleteDoc(doc(db, 'routes', routeId));
    } catch (error) {
      console.error('Error deleting route:', error);
      throw error;
    }
  }

  // Stock Management
  async updateBusStock(request: UpdateStockRequest): Promise<void> {
    try {
      const busRef = doc(db, 'buses', request.busId);
      const busDoc = await getDoc(busRef);
      
      if (!busDoc.exists()) {
        throw new Error('Bus not found');
      }

      const busData = busDoc.data() as BusDetails;
      const updatedItems = busData.inventory.items.map(item => {
        const update = request.items.find(u => u.id === item.id);
        if (update) {
          return {
            ...item,
            quantity: update.quantity,
            inStock: update.inStock
          };
        }
        return item;
      });

      await updateDoc(busRef, {
        'inventory.items': updatedItems,
        'inventory.totalItems': updatedItems.length,
        'inventory.lastUpdated': new Date(),
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating bus stock:', error);
      throw error;
    }
  }

  async addItemToBus(busId: string, item: FoodItem): Promise<void> {
    try {
      const busRef = doc(db, 'buses', busId);
      const busDoc = await getDoc(busRef);
      
      if (!busDoc.exists()) {
        throw new Error('Bus not found');
      }

      const busData = busDoc.data() as BusDetails;
      const updatedItems = [...busData.inventory.items, item];

      await updateDoc(busRef, {
        'inventory.items': updatedItems,
        'inventory.totalItems': updatedItems.length,
        'inventory.lastUpdated': new Date(),
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error adding item to bus:', error);
      throw error;
    }
  }

  // Data Retrieval
  async getAllBuses(): Promise<BusDetails[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'buses'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusDetails[];
    } catch (error) {
      console.error('Error getting buses:', error);
      throw error;
    }
  }

  async getAllRoutes(): Promise<BusRoute[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'routes'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusRoute[];
    } catch (error) {
      console.error('Error getting routes:', error);
      throw error;
    }
  }

  async getBusById(busId: string): Promise<BusDetails | null> {
    try {
      const docRef = doc(db, 'buses', busId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as BusDetails;
      }
      return null;
    } catch (error) {
      console.error('Error getting bus:', error);
      throw error;
    }
  }

  // Real-time listeners
  subscribeToBuses(callback: (buses: BusDetails[]) => void): () => void {
    const q = query(collection(db, 'buses'), orderBy('lastUpdate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const buses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusDetails[];
      
      callback(buses);
    });

    return unsubscribe;
  }

  subscribeToRoutes(callback: (routes: BusRoute[]) => void): () => void {
    const q = query(collection(db, 'routes'), orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const routes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BusRoute[];
      
      callback(routes);
    });

    return unsubscribe;
  }

  // Wipe all data from Firestore
  async wipeAllData(): Promise<void> {
    try {
      console.log('Starting to wipe all data...');
      
      // Delete all buses
      const busesSnapshot = await getDocs(collection(db, 'buses'));
      const busDeletePromises = busesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(busDeletePromises);
      console.log(`Deleted ${busesSnapshot.docs.length} buses`);
      
      // Delete all routes
      const routesSnapshot = await getDocs(collection(db, 'routes'));
      const routeDeletePromises = routesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(routeDeletePromises);
      console.log(`Deleted ${routesSnapshot.docs.length} routes`);
      
      console.log('All data wiped successfully!');
    } catch (error) {
      console.error('Error wiping all data:', error);
      throw error;
    }
  }
}

export const busService = new BusService(); 