import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import './App.css';

function App() {
  // Navigation / Views: 'login' | 'register' | 'dashboard' | 'profile'
  const [currentView, setCurrentView] = useState('login');
  
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
    <div className="auth-bg">
      <div className="mesh-gradient"></div>

      {/* RENDER NAVBAR FOR AUTHENTICATED USERS */}
      {currentUser && (
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onNavigate={handleNavigation} 
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className={`app-main-layout ${currentUser ? 'authenticated' : 'unauthenticated'}`}>
        {/* RENDER SIDEBAR FOR AUTHENTICATED USERS */}
        {currentUser && (
          <Sidebar 
            currentView={currentView} 
            onNavigate={handleNavigation} 
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
              {currentView === 'dashboard' && <Dashboard currentUser={currentUser} />}
              {currentView === 'profile' && <Profile currentUser={currentUser} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;


