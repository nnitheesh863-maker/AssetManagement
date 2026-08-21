import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function Navbar({ currentUser, onLogout, onToggleSidebar, onSearchChange, searchVal }) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80");
  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.photo) {
      setProfileImage(currentUser.photo);
    }
  }, [currentUser]);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        toast.success('Photo staged for saving');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/users/${currentUser.login_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          position: currentUser.position,
          address: currentUser.address,
          mobile: currentUser.mobile,
          photo: profileImage
        })
      });
      if (res.ok) {
        toast.success('Profile saved permanently!');
        setIsProfileModalOpen(false);
      } else {
        toast.error('Failed to save profile');
      }
    } catch (err) {
      toast.error('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sf-topbar" style={{ width: '100%', boxSizing: 'border-box' }}>
      <div className="sf-header-left" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div className="sf-icon-btn" onClick={onToggleSidebar} style={{ display: 'none' }}>
           <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </div>
        <div>
           <h1>Dashboard</h1>
           <p>Business overview and operational performance</p>
        </div>
      </div>

      <motion.div 
        className="sf-search"
        animate={{ width: isSearchFocused ? 450 : 320, borderColor: isSearchFocused ? 'var(--sf-text)' : 'var(--sf-panel-border)' }}
        transition={{ duration: 0.2 }}
        style={{ position: 'relative' }}
      >
        <svg width="16" height="16" fill="none" stroke={isSearchFocused ? 'var(--sf-text)' : 'var(--sf-text-muted)'} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input 
          type="text" 
          placeholder="Search orders, products, customers... (Press Ctrl+K)" 
          value={searchVal || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          style={{ background: 'none', border: 'none', color: 'var(--sf-text)', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '13px' }}
        />
        <AnimatePresence>
          {isSearchFocused && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', top: '48px', left: 0, width: '100%', background: 'var(--sf-panel-bg)', border: '1px solid var(--sf-panel-border)', borderRadius: '16px', padding: '16px', zIndex: 100, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
            >
              <div style={{ fontSize: '11px', color: 'var(--sf-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Suggested Actions</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="sf-badge done" style={{ cursor: 'pointer' }}>+ New Sales Order</span>
                <span className="sf-badge inprogress" style={{ cursor: 'pointer' }}>View Inventory</span>
                <span className="sf-badge warning" style={{ cursor: 'pointer' }}>Pending Procurement</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="sf-header-right">
         <div className="sf-status-indicator">
            <div className="sf-status-dot"></div> ERP Connected
         </div>
         
         <div className="sf-icon-btn">
           <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
         </div>
         
         <div className="sf-user-profile" onClick={() => setIsProfileModalOpen(true)} style={{ borderLeft: 'none', paddingLeft: '8px', cursor: 'pointer', position: 'relative' }}>
            <img 
              src={profileImage} 
              alt="Profile" 
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--sf-panel-border)' }} 
            />
            {/* Tooltip for profile functionality */}
            <div className="logout-tooltip" style={{ display: 'none', position: 'absolute', bottom: '-30px', right: '0', background: 'var(--sf-text)', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
              View Profile
            </div>
         </div>
      </div>

      {/* User Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }}
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', width: '600px', background: 'var(--sf-panel-bg)', borderRadius: '16px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid var(--sf-panel-border)' }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: 'var(--sf-text)' }}>User Login Detail Management</h2>
              
              <div style={{ display: 'flex', gap: '32px' }}>
                {/* Left Column: Form */}
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sf-text-muted)', marginBottom: '6px' }}>Name</label>
                    <input type="text" defaultValue={currentUser?.name || "Admin User"} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--sf-panel-border)', background: 'var(--sf-bg)', color: 'var(--sf-text)', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sf-text-muted)', marginBottom: '6px' }}>Address</label>
                    <input type="text" defaultValue="Colaba, Mumbai, 400001" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--sf-panel-border)', background: 'var(--sf-bg)', color: 'var(--sf-text)', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sf-text-muted)', marginBottom: '6px' }}>Mobile Number</label>
                    <input type="text" defaultValue="+918000000000" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--sf-panel-border)', background: 'var(--sf-bg)', color: 'var(--sf-text)', fontSize: '13px', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sf-text-muted)', marginBottom: '6px' }}>Email ID</label>
                      <span style={{ fontSize: '10px', color: 'var(--sf-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        Locked
                      </span>
                    </div>
                    <input type="text" disabled defaultValue="admin05@assetflow.com" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--sf-panel-border)', background: '#e5e7eb', color: 'var(--sf-text-muted)', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--sf-text-muted)', marginBottom: '6px' }}>Position</label>
                      <span style={{ fontSize: '10px', color: 'var(--sf-warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        Set by Admin Only
                      </span>
                    </div>
                    <input type="text" disabled defaultValue="System Administrator" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--sf-panel-border)', background: '#e5e7eb', color: 'var(--sf-text-muted)', fontSize: '13px', boxSizing: 'border-box', cursor: 'not-allowed' }} />
                  </div>

                </div>

                {/* Right Column: Profile Photo */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--sf-text-muted)', marginBottom: '12px' }}>Profile Photo</label>
                  <div style={{ position: 'relative', width: '140px', height: '140px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'var(--sf-text)', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      accept="image/png, image/jpeg" 
                      style={{ display: 'none' }} 
                    />
                  </div>
                  <p style={{ fontSize: '10px', color: 'var(--sf-text-muted)', textAlign: 'center', marginTop: '12px', lineHeight: '1.4' }}>
                    Supports JPG, PNG formats. Image is stored locally.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  style={{ flex: 1, background: '#d97757', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s', opacity: isSaving ? 0.7 : 1 }}
                  onMouseEnter={(e) => !isSaving && (e.target.style.background = '#c26649')}
                  onMouseLeave={(e) => !isSaving && (e.target.style.background = '#d97757')}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  onClick={onLogout}
                  style={{ padding: '0 24px', background: 'transparent', color: 'var(--sf-text)', border: '1px solid var(--sf-panel-border)', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '13px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--sf-bg)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Logout
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Navbar;
