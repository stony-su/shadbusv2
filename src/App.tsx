import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import Map from './components/Map';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import { initializeSampleData } from './utils/initializeData';
import { busService } from './services/busService';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

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
  // const [authState, setAuthState] = useState(authService.getCurrentUser()); // Unused, consider removing if not needed

  useEffect(() => {
    const testMode = localStorage.getItem('testMode') === 'true';
    if (testMode) {
      setCurrentView('admin');
      return;
    }
    const unsubscribe = authService.subscribe((state) => {
      // setAuthState(state.user); // This line was removed as per the edit hint
      if (state.user) {
        setCurrentView('admin');
      }
      if (!state.user && currentView === 'admin') {
        setCurrentView('map');
      }
    });
    (globalThis as { initializeSampleData?: typeof initializeSampleData }).initializeSampleData = initializeSampleData;
    if (typeof globalThis !== 'undefined') {
      (globalThis as { initializeSampleData?: typeof initializeSampleData, clearTestMode?: () => void }).initializeSampleData = initializeSampleData;
      (globalThis as { clearTestMode?: () => void }).clearTestMode = () => {
        localStorage.removeItem('testMode');
        globalThis.location.reload();
      };
      const autoInit = async () => {
        if (localStorage.getItem('testMode') === 'true') {
          try {
            await initializeSampleData();
          } catch (_error) {
            // Intentionally ignored
          }
        }
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
                  } catch (_error) {
                    // Intentionally ignored
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
                  } catch (_error) {
                    // Intentionally ignored
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