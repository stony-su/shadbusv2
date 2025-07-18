import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import Map from './components/Map';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import { initializeSampleData } from './utils/initializeData';
import { busService } from './services/busService';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    initializeSampleData: typeof initializeSampleData;
    clearTestMode: () => void;
  }
}

type AppView = 'map' | 'admin' | 'login' | 'signup';

// CustomerApp: Map only, no admin buttons
const CustomerApp: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="App">
      <div className="relative">
        <Map onTripleClick={() => navigate('/admin')} />
      </div>
    </div>
  );
};

// AdminApp: full admin logic
const AdminApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('map');
  const [authState, setAuthState] = useState(authService.getCurrentUser());

  useEffect(() => {
    const testMode = localStorage.getItem('testMode') === 'true';
    if (testMode) {
      setCurrentView('admin');
      return;
    }
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state.user);
      if (state.user) {
        setCurrentView('admin');
      }
      if (!state.user && currentView === 'admin') {
        setCurrentView('map');
      }
    });
    window.initializeSampleData = initializeSampleData;
    if (typeof window !== 'undefined') {
      window.initializeSampleData = initializeSampleData;
      window.clearTestMode = () => {
        localStorage.removeItem('testMode');
        window.location.reload();
      };
      const autoInit = async () => {
        try {
          const buses = await busService.getAllBuses();
          if (buses.length === 0) {
            await initializeSampleData();
          }
        } catch (_error: unknown) {
          console.error('Error initializing sample data:', _error);
      };
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
              <button
                onClick={async () => {
                  try {
                    await initializeSampleData();
                    alert('Sample data initialized successfully!');
                  } catch (_error: unknown) {
                    alert('Error initializing sample data. Check console for details.');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors text-sm"
              >
                Initialize Sample Data
              </button>
              <button
                onClick={async () => {
                  try {
                    const confirmed = globalThis.confirm('Are you sure you want to wipe ALL data? This action cannot be undone.');
                    if (!confirmed) return;
                    await busService.wipeAllData();
                    alert('All data wiped successfully!');
                  } catch (_error: unknown) {
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

  return <div className="App">{renderView()}</div>;
};

// Main App with routing
const App: React.FC = () => {
  return (
    <>
      <div id="google_translate_element" style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 2000 }}></div>
      <Router>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<CustomerApp />} />
        </Routes>
      </Router>
    </>
  );
};

export default App; 