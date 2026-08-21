import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

/* ═══════════════════════════════════════════
   Avatar helpers
 ═══════════════════════════════════════════ */
const COLORS = ['#CF8E6D','#8a6c58','#5D7052','#7a7a9d','#b05a6c','#4a8fa8','#a07850'];
const avatarColor = (n = '') => COLORS[(n.charCodeAt(0) || 0) % COLORS.length];
const initials   = (n = '') => n.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

/* Per-user field-level permissions (shown when a user is selected) */
const FIELD_PERMS = {
  Sales: [
    { field: 'Customer',           create: true,  view: true,  edit: true,  del: true  },
    { field: 'Customer Address',   create: true,  view: true,  edit: true,  del: true  },
    { field: 'Sales Person',       create: true,  view: true,  edit: true,  del: true  },
    { field: 'Product',            create: true,  view: true,  edit: true,  del: true  },
    { field: 'Ordered Quantity',   create: true,  view: true,  edit: true,  del: true  },
    { field: 'Delivered Quantity', create: true,  view: true,  edit: true,  del: true  },
    { field: 'Sales Price',        create: true,  view: true,  edit: true,  del: true  },
    { field: 'Status',             create: true,  view: true,  edit: true,  del: false },
    { field: 'Total',              create: true,  view: true,  edit: 'Auto Recomputed', del: false },
    { field: 'Creation Date',      create: 'Auto Compute', view: true, edit: false, del: false },
  ],
  Purchase: [
    { field: 'Vendor',              create: true,  view: true,  edit: true,  del: true  },
    { field: 'Vendor Address',      create: true,  view: true,  edit: true,  del: true  },
    { field: 'Responsible Person',  create: true,  view: true,  edit: true,  del: true  },
    { field: 'Product',             create: true,  view: true,  edit: true,  del: true  },
    { field: 'Ordered Quantity',    create: true,  view: true,  edit: true,  del: true  },
    { field: 'Received Quantity',   create: true,  view: true,  edit: true,  del: true  },
    { field: 'Cost Price',          create: true,  view: true,  edit: true,  del: true  },
    { field: 'Total',               create: true,  view: true,  edit: 'Auto Recomputed', del: false },
    { field: 'Creation Date',       create: 'Auto Compute', view: true, edit: false, del: false },
  ],
  Manufacturing: [
    { field: 'Product to Manufacture', create: true,  view: true,  edit: true,  del: true  },
    { field: 'Product Quantity',       create: true,  view: true,  edit: true,  del: true  },
    { field: 'BoM',                    create: true,  view: true,  edit: true,  del: true  },
    { field: 'Responsible Person',     create: true,  view: true,  edit: true,  del: true  },
    { field: 'Finished Quantity',      create: true,  view: true,  edit: true,  del: true  },
    { field: 'Creation Date',          create: 'Auto Compute', view: true, edit: false, del: false },
  ],
  Product: [
    { field: 'Product Name',       create: true,  view: true,  edit: true,  del: true  },
    { field: 'Category',           create: true,  view: true,  edit: true,  del: true  },
    { field: 'Unit Price',         create: true,  view: true,  edit: true,  del: true  },
    { field: 'Stock Quantity',     create: true,  view: true,  edit: true,  del: true  },
    { field: 'Min Stock Level',    create: true,  view: true,  edit: true,  del: true  },
    { field: 'Description',        create: true,  view: true,  edit: true,  del: true  },
    { field: 'Status',             create: true,  view: true,  edit: true,  del: false },
    { field: 'Creation Date',      create: 'Auto Compute', view: true, edit: false, del: false },
  ],
};

const FIELD_TABS = ['Sales', 'Purchase', 'Manufacturing', 'Product'];

function PermCell({ val }) {
  if (val === true)      return <span style={{ color: '#5D7052', fontSize: '17px', fontWeight: '900' }}>✓</span>;
  if (val === false)     return <span style={{ color: '#D95B5B', fontSize: '16px', fontWeight: '900' }}>✗</span>;
  if (val === 'Optional') return <span style={{ fontSize: '11px', fontWeight: '700', color: '#5D7052', background: 'rgba(93,112,82,0.12)', borderRadius: '5px', padding: '2px 8px' }}>Optional</span>;
  if (val === 'Limited')  return <span style={{ fontSize: '11px', fontWeight: '700', color: '#CF8E6D', background: 'rgba(207,142,109,0.12)', borderRadius: '5px', padding: '2px 8px' }}>Limited</span>;
  return <span style={{ fontSize: '11px', fontWeight: '700', color: '#a0683a', background: 'rgba(207,142,109,0.10)', borderRadius: '5px', padding: '2px 8px' }}>{String(val)}</span>;
}

export default function AdminDashboard({ currentUser, openAdminCreation }) {
  const [usersList, setUsersList]         = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedUser, setSelectedUser]   = useState(null);
  const [activeFieldTab, setActiveFieldTab] = useState('Sales');
  
  // Editable properties for selected user
  const [editPosition, setEditPosition]   = useState('');
  const [editRole, setEditRole]           = useState('PENDING');
  const [editStatus, setEditStatus]       = useState('PENDING');
  const [positionSaved, setPositionSaved] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminPwd, setAdminPwd] = useState(localStorage.getItem('assetflow_admin_creation_password') || '');

  // Add user form
  const [form, setForm]           = useState({ loginId:'', name:'', email:'', mobile:'', address:'', password:'', role:'SALES_USER', position:'', status:'ACTIVE' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Admin creation modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ loginId: '', password: '', confirmPassword: '' });
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    if (openAdminCreation) setIsAdminModalOpen(true);
  }, [openAdminCreation]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (e) {
      console.error('Failed to load users from DB:', e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = usersList.filter(u =>
    (u?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u?.login_id || u?.loginId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectUser = (u) => {
    setSelectedUser(u);
    setEditPosition(u.position || '');
    setEditRole(u.role || 'PENDING');
    setEditStatus(u.status || 'PENDING');
    setPositionSaved(false);
    setActiveFieldTab('Sales');
  };

  const saveUserDetails = async () => {
    try {
      const token = localStorage.getItem('assetflow_token');
      const userId = selectedUser.login_id || selectedUser.loginId;
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          position: editPosition,
          role: editRole,
          status: editStatus
        })
      });

      if (res.ok) {
        toast.success('User updated successfully');
        setPositionSaved(true);
        loadUsers();
        setSelectedUser(prev => ({ ...prev, position: editPosition, role: editRole, status: editStatus }));
        setTimeout(() => setPositionSaved(false), 2000);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to update user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving user.');
    }
  };

  const deleteUser = async (id) => {
    if (id === 'admin001' || id === currentUser?.loginId || id === currentUser?.login_id) { 
      alert('Cannot delete active admin.'); 
      return; 
    }
    if (!window.confirm('Delete user "' + id + '"?')) return;
    
    try {
      const token = localStorage.getItem('assetflow_token');
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('User deleted');
        loadUsers();
        if (selectedUser?.login_id === id || selectedUser?.loginId === id) { 
          setSelectedUser(null); 
        }
      } else {
        toast.error('Failed to delete user');
      }
    } catch (e) {
      toast.error('Connection error deleting user');
    }
  };

  const triggerConfettiBlast = () => {
    const runConfetti = () => {
      if (window.confetti) {
        window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    };
    if (!window.confetti) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
      script.onload = runConfetti;
      document.body.appendChild(script);
    } else {
      runConfetti();
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault(); 
    setFormError(''); 
    setFormSuccess('');

    if (!form.loginId || !form.name || !form.email || !form.password) { 
      setFormError('Login ID, Name, Email and Password are required.'); 
      return; 
    }

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: form.loginId,
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          address: form.address,
          password: form.password,
          role: form.role,
          position: form.position,
          status: 'ACTIVE' // Admin-created users are auto-active
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSuccess('User registered successfully!');
        triggerConfettiBlast();
        loadUsers();
        setTimeout(() => { 
          setIsAddModalOpen(false); 
          setForm({ loginId:'', name:'', email:'', mobile:'', address:'', password:'', role:'SALES_USER', position:'', status:'ACTIVE' }); 
          setFormSuccess(''); 
        }, 1200);
      } else {
        setFormError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setFormError('Failed to contact backend registration endpoint.');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault(); 
    setAdminFormError(''); 
    setAdminFormSuccess('');

    if (!adminForm.loginId || !adminForm.password) { 
      setAdminFormError('Login ID and Password are required.'); 
      return; 
    }
    if (adminForm.password !== adminForm.confirmPassword) { 
      setAdminFormError('Passwords do not match.'); 
      return; 
    }

    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: adminForm.loginId,
          name: 'Admin - ' + adminForm.loginId,
          email: adminForm.loginId + '@shivfurniture.com',
          password: adminForm.password,
          role: 'ADMIN',
          position: 'Admin',
          status: 'ACTIVE'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminFormSuccess('Admin account created successfully!');
        triggerConfettiBlast();
        loadUsers();
        setTimeout(() => { 
          setIsAdminModalOpen(false); 
          setAdminForm({ loginId:'', password:'', confirmPassword:'' }); 
          setAdminFormSuccess(''); 
        }, 1200);
      } else {
        setAdminFormError(data.message || 'Creation failed.');
      }
    } catch (err) {
      setAdminFormError('Error connecting to register endpoint.');
    }
  };

  const aff = (key) => (e) => setAdminForm(f => ({ ...f, [key]: e.target.value }));
  const ff = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="animated fadeIn" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ─── HEADER BAR ─── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderBottom:'1.5px solid rgba(207,142,109,0.13)', background:'rgba(30,41,59,0.95)', backdropFilter:'blur(12px)', flexWrap:'wrap', gap:'12px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" style={{width:'20px',height:'20px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:'20px', fontWeight:'800', color:'var(--sf-text)', margin:0 }}>Users & Access Permissions</h2>
            <p style={{ fontSize:'12px', color:'var(--sf-text-muted)', margin:'2px 0 0 0' }}>Review registered accounts, activate users, and grant Module permissions.</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          <button onClick={() => setShowAdminSettings(v => !v)}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'10px', border:'1px solid var(--sf-panel-border)', background:'rgba(255,255,255,0.03)', cursor:'pointer', fontSize:'12px', fontWeight:'700', color:'var(--sf-text)' }}>
            Settings
          </button>
          <button onClick={() => setIsAddModalOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 16px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', cursor:'pointer', fontSize:'12px', fontWeight:'700', color:'#fff', boxShadow:'0 3px 12px rgba(207,142,109,0.35)' }}>
            Add User
          </button>
        </div>
      </div>

      {showAdminSettings && (
        <div style={{ background:'rgba(255,255,255,0.02)', borderBottom:'1px solid var(--sf-panel-border)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', flexShrink:0 }}>
          <span style={{ fontSize:'13px', fontWeight:'700', color:'var(--sf-text)', whiteSpace:'nowrap' }}>🔐 Admin Creation Password:</span>
          <input type="text" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="Secret password for auto-admin"
            style={{ flex:'1', minWidth:'200px', height:'34px', borderRadius:'9px', border:'1px solid var(--sf-panel-border)', padding:'0 12px', fontSize:'13px', outline:'none', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)' }} />
          <button onClick={() => { localStorage.setItem('assetflow_admin_creation_password', adminPwd); toast.success('Saved admin creation key!'); }}
            style={{ height:'34px', padding:'0 18px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', color:'#fff', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Save</button>
        </div>
      )}

      {/* ═══ BODY: LEFT LIST + RIGHT PANEL ═══ */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* ─── LEFT: USER LIST ─── */}
        <div style={{ width:'280px', flexShrink:0, borderRight:'1px solid var(--sf-panel-border)', display:'flex', flexDirection:'column', background:'rgba(255,255,255,0.01)' }}>
          <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid var(--sf-panel-border)', flexShrink:0 }}>
            <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.08em', color:'var(--sf-text-muted)', textTransform:'uppercase', marginBottom:'10px' }}>
              Registered Users ({filtered.length})
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <input type="text" placeholder="Search user..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                style={{ width:'100%', height:'34px', borderRadius:'9px', border:'1px solid var(--sf-panel-border)', padding:'0 10px 0 12px', fontSize:'12px', background:'rgba(255,255,255,0.03)', color:'var(--sf-text)', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
            {filtered.length === 0 && <div style={{ padding:'20px', textAlign:'center', color:'var(--sf-text-muted)', fontSize:'12px' }}>No users found.</div>}
            {filtered.map(u => {
              const loginId = u.login_id || u.loginId;
              const isAdmin = u.role === 'System Administrator' || u.role === 'ADMIN';
              const sel = selectedUser?.login_id === loginId || selectedUser?.loginId === loginId;
              const photo = u.photo || '';
              return (
                <div key={loginId}
                  onClick={() => selectUser(u)}
                  style={{
                    display:'flex', alignItems:'center', gap:'11px', padding:'10px 16px', cursor:'pointer',
                    background: sel ? 'rgba(207,142,109,0.08)' : 'transparent',
                    borderLeft: sel ? '3px solid #CF8E6D' : '3px solid transparent',
                    transition:'all 0.15s',
                  }}
                >
                  <div style={{ width:'34px', height:'34px', borderRadius:'50%', background: avatarColor(u.name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#fff', flexShrink:0, overflow:'hidden' }}>
                    {photo ? <img src={photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : initials(u.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--sf-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name || loginId}</div>
                    <div style={{ fontSize:'11px', color: isAdmin ? '#CF8E6D' : 'var(--sf-text-muted)', marginTop:'1px' }}>{isAdmin ? '⭐ Admin' : (u.position || 'User')} ({u.status || 'PENDING'})</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div style={{ flex:1, overflow:'auto', padding:'22px 26px', display:'flex', flexDirection:'column', gap:'22px', minWidth:0 }}>

          {!selectedUser && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'14px', color:'var(--sf-text-muted)', padding:'60px 0' }}>
              <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(207,142,109,0.05)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="#CF8E6D" strokeWidth="1.5" style={{width:'36px',height:'36px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p style={{ fontSize:'15px', fontWeight:'600', margin:0, color:'var(--sf-text)' }}>Select a user to manage</p>
              <p style={{ fontSize:'13px', margin:0 }}>Click any user from the list on the left</p>
            </div>
          )}

          {selectedUser && (
            <>
              {/* Profile Card */}
              <div className="sf-panel" style={{ padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
                  <div>
                    <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--sf-text-muted)', marginBottom:'4px' }}>User Details & Review</div>
                    <div style={{ fontSize:'20px', fontWeight:'800', color:'var(--sf-text)' }}>{selectedUser.name}</div>
                  </div>
                  <button onClick={() => deleteUser(selectedUser.login_id || selectedUser.loginId)}
                    style={{ background:'rgba(217,91,91,0.1)', color:'#D95B5B', border:'1px solid rgba(217,91,91,0.3)', padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'700', cursor:'pointer' }}>
                    Delete Account
                  </button>
                </div>

                <div style={{ display:'flex', gap:'24px', alignItems:'flex-start', flexWrap:'wrap' }}>
                  <div style={{ width:'88px', height:'88px', borderRadius:'16px', background:'rgba(255,255,255,0.03)', border:'2px solid var(--sf-panel-border)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    {selectedUser.photo ? <img src={selectedUser.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:'26px',fontWeight:'800',color:'#CF8E6D'}}>{initials(selectedUser.name)}</span>}
                  </div>
                  <div style={{ flex:1, minWidth:'200px' }}>
                    {[
                      { l:'Address :',       v: selectedUser.address || 'Not provided' },
                      { l:'Mobile Number :', v: selectedUser.mobile || 'Not provided' },
                      { l:'Email ID :',      v: selectedUser.email },
                    ].map(({l,v}) => (
                      <div key={l} style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'9px' }}>
                        <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--sf-text-muted)', minWidth:'140px', flexShrink:0 }}>{l}</span>
                        <span style={{ fontSize:'14px', fontWeight:'600', color:'var(--sf-text)' }}>{v}</span>
                      </div>
                    ))}

                    {/* Edit Position */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px' }}>
                      <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--sf-text-muted)', minWidth:'140px', flexShrink:0 }}>Position :</span>
                      <input value={editPosition} onChange={e => setEditPosition(e.target.value)} placeholder="Set position..."
                        style={{ fontSize:'13px', fontWeight:'600', color:'var(--sf-text)', border:'1px solid var(--sf-panel-border)', borderRadius:'8px', padding:'6px 12px', background:'rgba(0,0,0,0.2)', outline:'none', flex:1 }} />
                    </div>

                    {/* Edit Role & Status */}
                    <div style={{ display:'flex', alignItems:'center', gap:'16px', marginBottom:'16px', flexWrap:'wrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--sf-text-muted)', minWidth:'140px', flexShrink:0 }}>Assigned Role :</span>
                        <select value={editRole} onChange={e => setEditRole(e.target.value)}
                          style={{ height:'36px', borderRadius:'8px', border:'1px solid var(--sf-panel-border)', padding:'0 10px', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)', outline:'none', fontSize:'13px', fontWeight:'600' }}>
                          <option value="PENDING">PENDING</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SALES_USER">SALES_USER</option>
                          <option value="PURCHASE_USER">PURCHASE_USER</option>
                          <option value="MANUFACTURING_USER">MANUFACTURING_USER</option>
                          <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                          <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
                        </select>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--sf-text-muted)' }}>Status :</span>
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                          style={{ height:'36px', borderRadius:'8px', border:'1px solid var(--sf-panel-border)', padding:'0 10px', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)', outline:'none', fontSize:'13px', fontWeight:'600' }}>
                          <option value="PENDING">PENDING (Disabled)</option>
                          <option value="ACTIVE">ACTIVE (Enabled)</option>
                        </select>
                      </div>
                    </div>

                    <button onClick={saveUserDetails}
                      style={{ fontSize:'12px', fontWeight:'700', color:'#fff', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', border:'none', borderRadius:'7px', padding:'8px 18px', cursor:'pointer', boxShadow:'0 2px 8px rgba(207,142,109,0.3)' }}>
                      {positionSaved ? '✓ Saved Changes' : 'Save Review Details'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Field-level permissions visualizer */}
              <div className="sf-panel" style={{ padding:'24px' }}>
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--sf-text-muted)', marginBottom:'4px' }}>Field-Level Permissions</div>
                  <div style={{ fontSize:'16px', fontWeight:'700', color:'var(--sf-text)' }}>Access matrix for <span style={{color:'#CF8E6D'}}>{selectedUser.name}</span> based on position</div>
                </div>
                
                <div style={{ display:'flex', gap:'4px', borderBottom:'2px solid var(--sf-panel-border)', flexWrap:'wrap' }}>
                  {FIELD_TABS.map(t => (
                    <button key={t} onClick={() => setActiveFieldTab(t)}
                      style={{
                        padding:'8px 20px', fontSize:'13px', fontWeight:'700', border:'none', borderRadius:'10px 10px 0 0', cursor:'pointer',
                        background: activeFieldTab === t ? 'linear-gradient(135deg,#CF8E6D,#a0683a)' : 'transparent',
                        color: activeFieldTab === t ? '#fff' : 'var(--sf-text-muted)',
                        marginBottom:'-2px', borderBottom: activeFieldTab === t ? '2px solid #CF8E6D' : '2px solid transparent', transition:'all 0.15s',
                      }}>{t}</button>
                  ))}
                </div>
                
                <div style={{ overflowX:'auto', borderRadius:'0 12px 12px 12px', border:'1px solid var(--sf-panel-border)' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr style={{ background:'rgba(255,255,255,0.01)' }}>
                        <th style={{ textAlign:'left', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--sf-text-muted)', borderBottom:'1px solid var(--sf-panel-border)' }}>Field</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--sf-text-muted)', borderBottom:'1px solid var(--sf-panel-border)' }}>Create</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--sf-text-muted)', borderBottom:'1px solid var(--sf-panel-border)' }}>View</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--sf-text-muted)', borderBottom:'1px solid var(--sf-panel-border)' }}>Edit</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--sf-text-muted)', borderBottom:'1px solid var(--sf-panel-border)' }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(FIELD_PERMS[activeFieldTab] || []).map((row, i) => (
                        <tr key={i} style={{ background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                          <td style={{ padding:'9px 14px', fontWeight:'600', color:'var(--sf-text)', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>{row.field}</td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}><PermCell val={row.create} /></td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}><PermCell val={row.view} /></td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}><PermCell val={row.edit} /></td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}><PermCell val={row.del} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════ ADD USER MODAL ══════════ */}
      {isAddModalOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}
          onClick={() => setIsAddModalOpen(false)}>
          <div style={{ background:'#1e293b', borderRadius:'22px', padding:'34px', width:'100%', maxWidth:'480px', maxHeight:'90vh', overflowY:'auto', position:'relative', border:'1px solid var(--sf-panel-border)' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { setIsAddModalOpen(false); setFormError(''); setFormSuccess(''); }}
              style={{ position:'absolute', top:'18px', right:'18px', background:'none', border:'none', fontSize:'22px', color:'var(--sf-text-muted)', cursor:'pointer' }}>&times;</button>

            <div style={{ textAlign:'center', marginBottom:'22px' }}>
              <h3 style={{ margin:0, fontSize:'20px', fontWeight:'800', color:'var(--sf-text)' }}>Add Enterprise User</h3>
              <p style={{ margin:'5px 0 0', fontSize:'13px', color:'var(--sf-text-muted)' }}>Pre-configure login credentials and modules for a new employee.</p>
            </div>

            <form onSubmit={handleAddUser} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
              {[
                { label:'Login ID *',  key:'loginId',  type:'text',     ph:'Username e.g. amit_s' },
                { label:'Full Name *', key:'name',     type:'text',     ph:'Full Name' },
                { label:'Email *',     key:'email',    type:'email',    ph:'name@shivfurniture.com' },
                { label:'Mobile',      key:'mobile',   type:'text',     ph:'Mobile number' },
                { label:'Address',     key:'address',  type:'text',     ph:'Address' },
                { label:'Password *',  key:'password', type:'password', ph:'Password' },
                { label:'Position',    key:'position', type:'text',     ph:'e.g. Sales Manager' },
              ].map(({label,key,type,ph}) => (
                <div key={key}>
                  <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--sf-text-muted)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={ff(key)} placeholder={ph}
                    style={{ width:'100%', height:'40px', borderRadius:'10px', border:'1px solid var(--sf-panel-border)', padding:'0 12px', fontSize:'13px', outline:'none', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)', boxSizing:'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--sf-text-muted)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Access Role</label>
                <select value={form.role} onChange={ff('role')}
                  style={{ width:'100%', height:'40px', borderRadius:'10px', border:'1px solid var(--sf-panel-border)', padding:'0 12px', fontSize:'13px', outline:'none', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)' }}>
                  <option value="SALES_USER">SALES_USER</option>
                  <option value="PURCHASE_USER">PURCHASE_USER</option>
                  <option value="MANUFACTURING_USER">MANUFACTURING_USER</option>
                  <option value="INVENTORY_MANAGER">INVENTORY_MANAGER</option>
                  <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              {formError   && <div style={{ background:'rgba(166,94,85,0.1)', border:'1px solid rgba(166,94,85,0.25)', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#A65E55', fontWeight:'600' }}>{formError}</div>}
              {formSuccess && <div style={{ background:'rgba(93,112,82,0.1)', border:'1px solid rgba(93,112,82,0.25)', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#5D7052', fontWeight:'600' }}>{formSuccess}</div>}
              <button type="submit"
                style={{ marginTop:'4px', height:'44px', borderRadius:'12px', border:'none', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', color:'#fff', fontWeight:'800', fontSize:'14px', cursor:'pointer', letterSpacing:'0.06em', boxShadow:'0 6px 20px rgba(207,142,109,0.35)' }}>
                REGISTER USER
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ CREATE ADMIN MODAL ══════════ */}
      {isAdminModalOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}
          onClick={() => setIsAdminModalOpen(false)}>
          <div style={{ background:'#1e293b', borderRadius:'22px', padding:'38px', width:'100%', maxWidth:'420px', position:'relative', border:'1px solid var(--sf-panel-border)' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { setIsAdminModalOpen(false); setAdminFormError(''); setAdminFormSuccess(''); }}
              style={{ position:'absolute', top:'18px', right:'18px', background:'none', border:'none', fontSize:'22px', color:'var(--sf-text-muted)', cursor:'pointer' }}>&times;</button>

            <div style={{ textAlign:'center', marginBottom:'26px' }}>
              <h3 style={{ margin:0, fontSize:'22px', fontWeight:'800', color:'var(--sf-text)' }}>Create Admin Account</h3>
              <p style={{ margin:'6px 0 0', fontSize:'13px', color:'var(--sf-text-muted)' }}>Grant superuser system access to a new administrator.</p>
            </div>

            <form onSubmit={handleCreateAdmin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--sf-text-muted)', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Admin Login ID *</label>
                <input type="text" value={adminForm.loginId} onChange={aff('loginId')} placeholder="e.g. admin_ravi"
                  style={{ width:'100%', height:'44px', borderRadius:'11px', border:'1px solid var(--sf-panel-border)', padding:'0 14px', fontSize:'14px', outline:'none', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--sf-text-muted)', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Password *</label>
                <input type="password" value={adminForm.password} onChange={aff('password')} placeholder="Minimum 6 characters"
                  style={{ width:'100%', height:'44px', borderRadius:'11px', border:'1.5px solid var(--sf-panel-border)', padding:'0 14px', fontSize:'14px', outline:'none', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--sf-text-muted)', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Confirm Password *</label>
                <input type="password" value={adminForm.confirmPassword} onChange={aff('confirmPassword')} placeholder="Re-enter password"
                  style={{ width:'100%', height:'44px', borderRadius:'11px', border:'1.5px solid var(--sf-panel-border)', padding:'0 14px', fontSize:'14px', outline:'none', background:'rgba(0,0,0,0.2)', color:'var(--sf-text)', boxSizing:'border-box' }} />
              </div>
              {adminFormError   && <div style={{ background:'rgba(166,94,85,0.1)', border:'1px solid rgba(166,94,85,0.25)', borderRadius:'9px', padding:'10px 14px', fontSize:'12px', color:'#A65E55', fontWeight:'600' }}>{adminFormError}</div>}
              {adminFormSuccess && <div style={{ background:'rgba(93,112,82,0.1)', border:'1px solid rgba(93,112,82,0.25)', borderRadius:'9px', padding:'10px 14px', fontSize:'12px', color:'#5D7052', fontWeight:'600' }}>{adminFormSuccess}</div>}
              <button type="submit"
                style={{ marginTop:'6px', height:'48px', borderRadius:'13px', border:'none', background:'linear-gradient(135deg,#d4af37,#a0683a)', color:'#fff', fontWeight:'800', fontSize:'15px', cursor:'pointer', letterSpacing:'0.06em', boxShadow:'0 6px 24px rgba(212,175,55,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                CREATE ADMIN ACCOUNT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
