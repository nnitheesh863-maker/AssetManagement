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
import AdminDashboard from './pages/AdminDashboard';
import UserManagementPermissions from './pages/UserManagementPermissions';
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

  // Cleanup teacher@gmail.com from local storage if exists
  useEffect(() => {
    const storedUsers = localStorage.getItem('assetflow_users');
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        const filtered = parsed.filter(
          (u) => u.loginId !== 'teacher@gmail.com' && u.email !== 'teacher@gmail.com'
        );
        if (parsed.length !== filtered.length) {
          localStorage.setItem('assetflow_users', JSON.stringify(filtered));
          setUsers(filtered);
        }
      } catch (e) {
        console.error('Failed to clean up local storage users:', e);
      }
    }
  }, []);

  // Auto-redirect logged-in users
  useEffect(() => {
    if (currentUser) {
      const isAdm = currentUser.role === 'System Administrator' || 
                    currentUser.role === 'ADMIN' || 
                    String(currentUser.role).toLowerCase().includes('admin');
      if (isAdm) {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('dashboard');
      }
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

    // Switch to login page or auto-login if admin
    if (newUser.role === 'System Administrator') {
      setCurrentUser(newUser); 
    } else {
      setCurrentView('login');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const [profilePhoto, setProfilePhoto] = useState('');

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`assetflow_profile_${currentUser.loginId}`);
      if (saved) {
        try {
          setProfilePhoto(JSON.parse(saved).photo || '');
        } catch (e) {
          setProfilePhoto('');
        }
      } else {
        setProfilePhoto('');
      }
    } else {
      setProfilePhoto('');
    }
  }, [currentUser]);

  const [auditLogModuleFilter, setAuditLogModuleFilter] = useState('All Modules');

  const handleNavigation = (view, filter = 'All Modules') => {
    setCurrentView(view);
    if (view === 'audit-logs') {
      setAuditLogModuleFilter(filter);
    }
  };

  const getRootBgClass = () => {
    if (currentUser) return "authenticated-root";
    if (currentView === 'register') return "auth-bg register-page-bg";
    return "auth-bg";
  };

  return (
    <div className={getRootBgClass()}>
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
          profilePhoto={profilePhoto}
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
            currentUser={currentUser}
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
              {currentView === 'sales-orders' && <SalesOrders onNavigate={handleNavigation} />}
              {currentView === 'purchase-orders' && <PurchaseOrders onNavigate={handleNavigation} />}
              {currentView === 'manufacturing-orders' && <ManufacturingOrders onNavigate={handleNavigation} />}
              {currentView === 'bom' && <BOM onNavigate={handleNavigation} />}
              {currentView === 'products' && <Products />}
              {currentView === 'audit-logs' && <AuditLogs defaultModuleFilter={auditLogModuleFilter} />}
              {currentView === 'profile' && (
                <Profile 
                  currentUser={currentUser} 
                  onProfileUpdate={(newPhoto) => setProfilePhoto(newPhoto)} 
                />
              )}
              {currentView === 'settings' && <Settings />}
              {currentView === 'notifications' && <Notifications />}
              {currentView === 'admin-dashboard' && <AdminDashboard currentUser={currentUser} />}
              {currentView === 'user-permissions' && <UserManagementPermissions />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
