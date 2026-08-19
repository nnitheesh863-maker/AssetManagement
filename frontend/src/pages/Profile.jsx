import React, { useState, useEffect } from 'react';

function Profile({ currentUser }) {
  // Local storage key specific to this logged in user
  const storageKey = `assetflow_profile_${currentUser.loginId}`;

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [photo, setPhoto] = useState(''); // base64 string
  
  // Feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Read-only fields from currentUser session
  const email = currentUser.email;
  const position = currentUser.role === 'System Administrator' ? 'Administrator' : 'Sales Manager';

  // Load profile data on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setName(parsed.name || '');
        setAddress(parsed.address || '');
        setMobile(parsed.mobile || '');
        setPhoto(parsed.photo || '');
      } catch (e) {
        console.error('Error parsing profile data', e);
      }
    } else {
      // Preseed default values matching mockup
      setName(currentUser.role === 'System Administrator' ? 'Admin User' : 'Mahesh Gupta');
      setAddress('Colaba, Mumbai, 400001');
      setMobile('+918000000000');
      setPhoto('');
    }
  }, [storageKey, currentUser]);

  // Handle image upload and base64 conversion
  const handlePhotoClick = () => {
    document.getElementById('profile-file-input').click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes to localStorage database
  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    const profileData = {
      name,
      address,
      mobile,
      photo
    };

    setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(profileData));
      setIsSaving(false);
      setSuccessMessage('Profile details updated successfully!');
      // Clear toast after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 600);
  };

  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="dashboard-header-block" style={{ width: '100%', maxWidth: '800px', textAlign: 'left', marginBottom: '24px' }}>
        <h2>User Profile</h2>
        <p className="sys-desc">Manage employee login details and database profile credentials</p>
      </div>

      <div className="card glass" style={{ width: '100%', maxWidth: '800px', padding: '36px', boxSizing: 'border-box' }}>
        <h3 className="audit-table-title" style={{ fontSize: '22px', marginBottom: '24px', textAlign: 'left', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
          User Login Detail Management
        </h3>

        {successMessage && (
          <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px', fontSize: '16px', fontWeight: '600', textAlign: 'left' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Form Fields Left Side */}
            <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Name field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="filter-control-input"
                  style={{ width: '100%', fontSize: '18px' }}
                  required
                />
              </div>

              {/* Address field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="filter-control-input"
                  style={{ width: '100%', fontSize: '18px' }}
                  required
                />
              </div>

              {/* Mobile number field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Mobile Number</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="filter-control-input"
                  style={{ width: '100%', fontSize: '18px' }}
                  required
                />
              </div>

              {/* Email ID field (Read Only) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Email ID</label>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🔒 Locked
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="filter-control-input"
                  style={{ width: '100%', fontSize: '18px', background: 'rgba(0,0,0,0.06)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
                />
              </div>

              {/* Position field (Read Only) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Position</label>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🔒 Read-Only
                  </span>
                </div>
                <input
                  type="text"
                  value={position}
                  readOnly
                  className="filter-control-input"
                  style={{ width: '100%', fontSize: '18px', background: 'rgba(0,0,0,0.06)', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
                />
              </div>

            </div>

            {/* Profile Photo Upload Frame Right Side */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>Profile Photo</span>
              
              <div 
                onClick={handlePhotoClick}
                style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '16px', 
                  border: '2px dashed var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative', 
                  cursor: 'pointer', 
                  overflow: 'hidden',
                  background: 'rgba(207, 142, 109, 0.03)',
                  transition: 'all 0.2s'
                }}
                className="profile-photo-hover"
              >
                {photo ? (
                  <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '40px', height: '40px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span style={{ fontSize: '12px' }}>Upload Photo</span>
                  </div>
                )}

                {/* Edit Pencil Icon Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>

              {/* Hidden file input */}
              <input 
                id="profile-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '180px', margin: 0, lineHeight: '1.4' }}>
                Supports JPG, PNG formats. Image is stored locally.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSaving}
              style={{ fontSize: '18px', padding: '12px 32px' }}
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
