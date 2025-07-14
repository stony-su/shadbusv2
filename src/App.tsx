import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import Map from './components/Map';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import { initializeSampleData } from './utils/initializeData';
import { busService } from './services/busService';

type AppView = 'map' | 'admin' | 'login' | 'signup';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [authState, setAuthState] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Check for test mode
    const testMode = localStorage.getItem('testMode') === 'true';
    
    if (testMode) {
      setCurrentView('admin');
      return;
    }

    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state.user);
      
      // If user is authenticated, switch to admin view (regardless of current view)
      if (state.user) {
        setCurrentView('admin');
      }
      
      // If user logs out, always go back to map view
      if (!state.user && currentView === 'admin') {
        setCurrentView('map');
      }
    });

    // Make initializeSampleData available globally for testing
    (window as any).initializeSampleData = initializeSampleData;
    
    // Also expose it immediately for console access
    if (typeof window !== 'undefined') {
      (window as any).initializeSampleData = initializeSampleData;
      console.log('initializeSampleData is now available in console');
      
      // Add function to clear test mode for debugging
      (window as any).clearTestMode = () => {
        localStorage.removeItem('testMode');
        window.location.reload();
      };
      console.log('clearTestMode() is now available in console');
      
      // Auto-initialize sample data if no buses exist (for development)
      const autoInit = async () => {
        try {
          const buses = await busService.getAllBuses();
          if (buses.length === 0) {
            console.log('No buses found, auto-initializing sample data...');
            await initializeSampleData();
            console.log('Sample data auto-initialized successfully!');
          } else {
            console.log(`Found ${buses.length} existing buses`);
          }
        } catch (error) {
          console.error('Error checking/initializing sample data:', error);
        }
      };
      
      // Run auto-init after a short delay to ensure Firebase is ready
      setTimeout(autoInit, 1000);
    }

    return unsubscribe;
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminDashboard />;
      case 'login':
        return <LoginForm onSwitchToSignup={() => setCurrentView('signup')} />;
      case 'signup':
        return <SignupForm onSwitchToLogin={() => setCurrentView('login')} />;
      case 'map':
      default:
        return (
          <div className="relative">
            <Map />
            {/* Admin Access Buttons - Bottom Left Corner */}
            <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
              <button
                onClick={() => setCurrentView('login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
              >
                Admin Login
              </button>
              {/* Development button for initializing sample data */}
              <button
                onClick={async () => {
                  try {
                    console.log('Initializing sample data...');
                    await initializeSampleData();
                    console.log('Sample data initialized successfully!');
                    alert('Sample data initialized successfully!');
                  } catch (error) {
                    console.error('Error initializing sample data:', error);
                    alert('Error initializing sample data. Check console for details.');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors text-sm"
              >
                Initialize Sample Data
              </button>
              {/* Development button for wiping all data */}
              <button
                onClick={async () => {
                  try {
                    const confirmed = window.confirm('Are you sure you want to wipe ALL data? This action cannot be undone.');
                    if (!confirmed) return;
                    
                    console.log('Wiping all data...');
                    await busService.wipeAllData();
                    console.log('All data wiped successfully!');
                    alert('All data wiped successfully!');
                  } catch (error) {
                    console.error('Error wiping all data:', error);
                    alert('Error wiping all data. Check console for details.');
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm"
              >
                Wipe All Data
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderView()}
    </div>
  );
};

export default App; 