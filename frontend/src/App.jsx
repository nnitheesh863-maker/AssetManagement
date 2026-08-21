import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryDashboard from './pages/inventory/InventoryDashboard';
import StockManagement from './pages/inventory/StockManagement';
import StockLedger from './pages/inventory/StockLedger';
import StockAdjustment from './pages/inventory/StockAdjustment';
import Warehouse from './pages/inventory/Warehouse';
import InventoryReports from './pages/inventory/InventoryReports';
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
import './pages/Dashboard.css';

const ROLE_PERMISSIONS = {
  'System Administrator': [
    "dashboard.view", "users.view", "users.create", "users.edit", "users.assign_role",
    "sales.view", "sales.create", "sales.edit", "sales.delete",
    "purchase.view", "purchase.create", "purchase.edit", "purchase.delete",
    "manufacturing.view", "manufacturing.create", "manufacturing.edit", "manufacturing.delete",
    "inventory.view", "inventory.edit", "products.view", "products.create", "products.edit",
    "bom.view", "bom.create", "bom.edit", "audit.view", "settings.view"
  ],
  'ADMIN': [
    "dashboard.view", "users.view", "users.create", "users.edit", "users.assign_role",
    "sales.view", "sales.create", "sales.edit", "sales.delete",
    "purchase.view", "purchase.create", "purchase.edit", "purchase.delete",
    "manufacturing.view", "manufacturing.create", "manufacturing.edit", "manufacturing.delete",
    "inventory.view", "inventory.edit", "products.view", "products.create", "products.edit",
    "bom.view", "bom.create", "bom.edit", "audit.view", "settings.view"
  ],
  'SALES_USER': [
    "dashboard.view", "sales.view", "sales.create", "sales.edit", "products.view", "inventory.view"
  ],
  'PURCHASE_USER': [
    "dashboard.view", "purchase.view", "purchase.create", "purchase.edit", "products.view", "inventory.view", "procurement.view"
  ],
  'MANUFACTURING_USER': [
    "dashboard.view", "manufacturing.view", "manufacturing.create", "manufacturing.edit", "bom.view", "inventory.view"
  ],
  'INVENTORY_MANAGER': [
    "dashboard.view", "inventory.view", "inventory.edit", "products.view", "products.edit", "stock_ledger.view", "procurement.view"
  ],
  'BUSINESS_OWNER': [
    "dashboard.view", "products.view", "products.create", "products.edit", "sales.view", "purchase.view", "manufacturing.view", "inventory.view", "procurement.view", "analytics.view"
  ],
  'PENDING': []
};

const VIEW_PERMISSIONS = {
  'dashboard': 'dashboard.view',
  'sales-orders': 'sales.view',
  'purchase-orders': 'purchase.view',
  'manufacturing-orders': 'manufacturing.view',
  'bom': 'bom.view',
  'products': 'products.view',
  'inventory-dashboard': 'inventory.view',
  'inventory-stock': 'inventory.view',
  'inventory-ledger': 'inventory.view',
  'inventory-adjustment': 'inventory.edit',
  'inventory-warehouses': 'inventory.view',
  'inventory-reports': 'inventory.view',
  'users': 'users.view',
  'audit-logs': 'audit.view',
};

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [auditLogModuleFilter, setAuditLogModuleFilter] = useState('All Modules');

  // Auto-redirect logged-in users based on role
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
    // Navigate back to login page
    setCurrentView('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('assetflow_token');
    setCurrentUser(null);
  };

  const handleProfileUpdate = (updatedFields) => {
    setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
    if (updatedFields.photo !== undefined) {
      setProfilePhoto(updatedFields.photo);
      localStorage.setItem(`assetflow_profile_${currentUser.loginId || currentUser.login_id}`, JSON.stringify({ photo: updatedFields.photo }));
    }
  };

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

  const handleNavigation = (view, filter = 'All Modules') => {
    const userRole = currentUser?.role || 'PENDING';
    const allowedPerms = ROLE_PERMISSIONS[userRole] || [];
    const requiredPermission = VIEW_PERMISSIONS[view];
    
    if (requiredPermission && !allowedPerms.includes(requiredPermission) && userRole !== 'System Administrator' && userRole !== 'ADMIN') {
      setCurrentView('unauthorized');
    } else {
      setCurrentView(view);
    }

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
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            fontSize: '14px',
            borderRadius: '8px'
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1e293b' },
          },
        }}
      />
      <div className="mesh-gradient"></div>

      {currentUser ? (
        /* AUTHENTICATED FLOW */
        <div className="sf-container">
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigation}
            isCollapsed={isSidebarCollapsed}
            currentUser={currentUser}
          />
          <div className="sf-main">
            <Navbar
              currentUser={currentUser}
              onLogout={handleLogout}
              onNavigate={handleNavigation}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onSearchChange={setSearchVal}
              searchVal={searchVal}
              profilePhoto={profilePhoto}
              onProfileUpdate={handleProfileUpdate}
            />
            <main className="sf-dashboard-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  {currentView === 'dashboard' && (
                    <Dashboard
                      currentUser={currentUser}
                      onNavigate={handleNavigation}
                      searchVal={searchVal}
                    />
                  )}
                  {currentView === 'sales-orders' && <SalesOrders onNavigate={handleNavigation} currentUser={currentUser} />}
                  {currentView === 'purchase-orders' && <PurchaseOrders onNavigate={handleNavigation} currentUser={currentUser} />}
                  {currentView === 'manufacturing-orders' && <ManufacturingOrders onNavigate={handleNavigation} currentUser={currentUser} />}
                  {currentView === 'bom' && <BOM onNavigate={handleNavigation} currentUser={currentUser} />}
                  {currentView === 'products' && <Products currentUser={currentUser} />}
                  {currentView === 'inventory-dashboard' && <InventoryDashboard currentUser={currentUser} />}
                  {currentView === 'inventory-stock' && <StockManagement currentUser={currentUser} />}
                  {currentView === 'inventory-ledger' && <StockLedger currentUser={currentUser} />}
                  {currentView === 'inventory-adjustment' && <StockAdjustment currentUser={currentUser} />}
                  {currentView === 'inventory-warehouses' && <Warehouse currentUser={currentUser} />}
                  {currentView === 'inventory-reports' && <InventoryReports currentUser={currentUser} />}
                  {currentView === 'audit-logs' && <AuditLogs defaultModuleFilter={auditLogModuleFilter} currentUser={currentUser} />}
                  {currentView === 'users' && <AdminDashboard currentUser={currentUser} />}
                  {currentView === 'profile' && (
                    <Profile
                      currentUser={currentUser}
                      onProfileUpdate={handleProfileUpdate}
                    />
                  )}
                  {currentView === 'settings' && <Settings />}
                  {currentView === 'notifications' && <Notifications />}
                  {currentView === 'user-permissions' && <UserManagementPermissions />}
                  
                  {currentView === 'unauthorized' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px', textAlign: 'center' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(217,91,91,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                        <svg width="40" height="40" fill="none" stroke="#D95B5B" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '10px' }}>403 Unauthorized</h2>
                      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '24px' }}>You don't have permission to access this module. Please contact your system administrator if you believe this is an error.</p>
                      <button 
                        className="sf-btn" 
                        onClick={() => setCurrentView('dashboard')}
                        style={{ background: 'var(--sf-gold)', color: '#000', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Back to Dashboard
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      ) : (
        /* UNAUTHENTICATED FLOW */
        <div className="app-main-layout unauthenticated">
          <main className="content-container" style={{ padding: 0 }}>
            {currentView === 'login' && (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onNavigateToRegister={() => setCurrentView('register')}
              />
            )}
            {currentView === 'register' && (
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                onNavigateToLogin={() => setCurrentView('login')}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
