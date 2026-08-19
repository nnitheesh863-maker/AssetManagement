import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SalesOrders from './pages/SalesOrders';
import PurchaseOrders from './pages/PurchaseOrders';
import ManufacturingOrders from './pages/ManufacturingOrders';
import BOM from './pages/BOM';
import Products from './pages/Products';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import './App.css';

function App() {
  // Navigation / Views: 'login' | 'register' | 'dashboard' | 'profile' | 'sales-orders' | 'purchase-orders' | 'manufacturing-orders' | 'bom' | 'products' | 'audit-logs' | 'settings' | 'notifications'
  const [currentView, setCurrentView] = useState('login');
  
  // Collapse state for master menu sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global search input state
  const [searchVal, setSearchVal] = useState('');

  // Simulated local databases
  const [users, setUsers] = useState(() => {
    const storedUsers = localStorage.getItem('assetflow_users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  });
  const [currentUser, setCurrentUser] = useState(null);

  // Auto-redirect logged-in users
  useEffect(() => {
    if (currentUser) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
    setSearchVal(''); // Reset search on auth toggle
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleRegisterSuccess = (newUser) => {
    // Add user to database
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('assetflow_users', JSON.stringify(updatedUsers));
    
    // Switch to login page
    setCurrentView('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  return (
    <div className={currentUser ? "authenticated-root" : "auth-bg"}>
      <div className="mesh-gradient"></div>

      {/* RENDER NAVBAR FOR AUTHENTICATED USERS */}
      {currentUser && (
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onNavigate={handleNavigation} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onSearchChange={setSearchVal}
          searchVal={searchVal}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className={`app-main-layout ${currentUser ? 'authenticated' : 'unauthenticated'}`}>
        {/* RENDER SIDEBAR FOR AUTHENTICATED USERS */}
        {currentUser && (
          <Sidebar 
            currentView={currentView} 
            onNavigate={handleNavigation} 
            isCollapsed={isSidebarCollapsed}
          />
        )}

        {/* VIEW ROUTER PANEL */}
        <main className="content-container">
          {!currentUser ? (
            /* UNAUTHENTICATED FLOW */
            <>
              {currentView === 'login' && (
                <Login 
                  users={users} 
                  onLoginSuccess={handleLoginSuccess} 
                  onNavigateToRegister={() => setCurrentView('register')} 
                />
              )}
              {currentView === 'register' && (
                <Register 
                  users={users} 
                  onRegisterSuccess={handleRegisterSuccess} 
                  onNavigateToLogin={() => setCurrentView('login')} 
                />
              )}
            </>
          ) : (
            /* AUTHENTICATED FLOW */
            <>
              {currentView === 'dashboard' && (
                <Dashboard 
                  currentUser={currentUser} 
                  onNavigate={handleNavigation} 
                  searchVal={searchVal} 
                />
              )}
              {currentView === 'sales-orders' && <SalesOrders />}
              {currentView === 'purchase-orders' && <PurchaseOrders />}
              {currentView === 'manufacturing-orders' && <ManufacturingOrders />}
              {currentView === 'bom' && <BOM />}
              {currentView === 'products' && <Products />}
              {currentView === 'audit-logs' && <AuditLogs />}
              {currentView === 'profile' && <Profile currentUser={currentUser} />}
              {currentView === 'settings' && <Settings />}
              {currentView === 'notifications' && <Notifications />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
