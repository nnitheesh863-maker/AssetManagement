import React, { useState, useEffect } from 'react';

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

/* ═══════════════════════════════════════════
   Default seed users
═══════════════════════════════════════════ */
const DEFAULT_USERS = [
  { loginId: 'mahesh_g', name: 'Mahesh Gupta',  email: 'mahesh@shivfurniture.com', role: 'User', position: 'Sales Manager',  address: 'Colaba, Mumbai, 400001',   mobile: '+918000000000' },
  { loginId: 'nisarg_v', name: 'Nisarg Verma',  email: 'nisarg@gmail.com',          role: 'User', position: 'Purchase Head',   address: 'Andheri, Mumbai, 400053',  mobile: '+919000000001' },
  { loginId: 'sweta_k',  name: 'Sweta Kediva',  email: 'sweta.kediva@kprcas.ac.in', role: 'User', position: 'Warehouse Staff', address: 'Bandra, Mumbai, 400050',   mobile: '+919000000002' },
  { loginId: 'dinesh_p', name: 'Dinesh Patel',  email: 'dinesh@gmail.com',          role: 'User', position: 'Account Manager', address: 'Dadar, Mumbai, 400014',    mobile: '+919000000003' },
  { loginId: 'trisha_k', name: 'Trisha K.',     email: 'trisha@gmail.com',          role: 'User', position: 'HR Executive',    address: 'Borivali, Mumbai, 400092', mobile: '+919000000004' },
];

/* ═══════════════════════════════════════════
   Reusable cell renderers
═══════════════════════════════════════════ */
function PermCell({ val }) {
  if (val === true)      return <span style={{ color: '#5D7052', fontSize: '17px', fontWeight: '900' }}>✓</span>;
  if (val === false)     return <span style={{ color: '#D95B5B', fontSize: '16px', fontWeight: '900' }}>✗</span>;
  if (val === 'Optional') return <span style={{ fontSize: '11px', fontWeight: '700', color: '#5D7052', background: 'rgba(93,112,82,0.12)', borderRadius: '5px', padding: '2px 8px' }}>Optional</span>;
  if (val === 'Limited')  return <span style={{ fontSize: '11px', fontWeight: '700', color: '#CF8E6D', background: 'rgba(207,142,109,0.12)', borderRadius: '5px', padding: '2px 8px' }}>Limited</span>;
  return <span style={{ fontSize: '11px', fontWeight: '700', color: '#a0683a', background: 'rgba(207,142,109,0.10)', borderRadius: '5px', padding: '2px 8px' }}>{String(val)}</span>;
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function AdminDashboard({ currentUser, openAdminCreation }) {
  // State
  const [usersList, setUsersList]         = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [selectedUser, setSelectedUser]   = useState(null);
  const [activeFieldTab, setActiveFieldTab] = useState('Sales');
  const [editPosition, setEditPosition]   = useState('');
  const [positionSaved, setPositionSaved] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [adminPwd, setAdminPwd] = useState(localStorage.getItem('assetflow_admin_creation_password') || '');

  // Add-user form
  const [form, setForm]           = useState({ loginId:'', name:'', email:'', mobile:'', address:'', password:'', role:'User', position:'' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Admin creation modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ loginId: '', password: '', confirmPassword: '' });
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');

  // Auto-open admin creation modal if navigated from sidebar
  useEffect(() => {
    if (openAdminCreation) setIsAdminModalOpen(true);
  }, [openAdminCreation]);

  /* ── Load users ── */
  useEffect(() => {
    const stored = localStorage.getItem('assetflow_users');
    let base = [...DEFAULT_USERS];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const combined = [...parsed];
        DEFAULT_USERS.forEach(d => {
          if (!combined.some(u => u?.loginId?.toLowerCase() === d.loginId.toLowerCase()))
            combined.push(d);
        });
        base = combined;
      } catch { /* keep default */ }
    }
    setUsersList(base);
    localStorage.setItem('assetflow_users', JSON.stringify(base));
  }, []);

  /* ── Filtered users ── */
  const filtered = usersList.filter(u =>
    u?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u?.loginId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Handlers ── */
  const selectUser = (u) => {
    setSelectedUser(u);
    setEditPosition(u.position || '');
    setPositionSaved(false);
    setRightView('profile');
    setActiveFieldTab('Sales');
  };

  const savePosition = () => {
    const updated = usersList.map(u =>
      u.loginId === selectedUser.loginId ? { ...u, position: editPosition } : u
    );
    setUsersList(updated);
    localStorage.setItem('assetflow_users', JSON.stringify(updated));
    setSelectedUser(p => ({ ...p, position: editPosition }));
    setPositionSaved(true);
    setTimeout(() => setPositionSaved(false), 2000);
  };

  const deleteUser = (id) => {
    if (id === 'admin001' || id === currentUser?.loginId) { alert('Cannot delete active admin.'); return; }
    if (!window.confirm('Delete user "' + id + '"?')) return;
    const updated = usersList.filter(u => u.loginId !== id);
    setUsersList(updated);
    localStorage.setItem('assetflow_users', JSON.stringify(updated));
    if (selectedUser?.loginId === id) { setSelectedUser(null); setRightView('permissions'); }
  };

  const triggerConfettiBlast = () => {
    // Dynamic import of confetti from CDN if not already loaded globally
    const runConfetti = () => {
      if (window.confetti) {
        // Blast
        window.confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        
        // Snow (lasts 2.5 seconds)
        const duration = 2.5 * 1000;
        const animationEnd = Date.now() + duration;
        const skew = 1;

        const frame = () => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return;
          const ticks = Math.max(200, 500 * (timeLeft / duration));
          window.confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: ticks,
            origin: {
              x: Math.random(),
              y: (Math.random() * skew) - 0.2
            },
            colors: ['#CF8E6D', '#a0683a', '#ffffff', '#d4af37'],
            shapes: ['circle'],
            gravity: Math.random() * 0.4 + 0.2,
            scalar: Math.random() * 0.7 + 0.5,
            drift: Math.random() * 2 - 1
          });
          requestAnimationFrame(frame);
        };
        frame();
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

  const handleAddUser = (e) => {
    e.preventDefault(); setFormError(''); setFormSuccess('');
    if (!form.loginId || !form.name || !form.email || !form.password) { setFormError('Login ID, Name, Email and Password are required.'); return; }
    if (usersList.some(u => u?.loginId?.toLowerCase() === form.loginId.toLowerCase())) { setFormError('Login ID already exists.'); return; }
    const updated = [{ ...form }, ...usersList];
    setUsersList(updated);
    localStorage.setItem('assetflow_users', JSON.stringify(updated));
    setFormSuccess('User registered!');
    triggerConfettiBlast();
    setTimeout(() => { setIsAddModalOpen(false); setForm({ loginId:'', name:'', email:'', mobile:'', address:'', password:'', role:'User', position:'' }); setFormSuccess(''); }, 900);
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault(); setAdminFormError(''); setAdminFormSuccess('');
    if (!adminForm.loginId || !adminForm.password) { setAdminFormError('Login ID and Password are required.'); return; }
    if (adminForm.loginId.length < 4) { setAdminFormError('Login ID must be at least 4 characters.'); return; }
    if (adminForm.password.length < 6) { setAdminFormError('Password must be at least 6 characters.'); return; }
    if (adminForm.password !== adminForm.confirmPassword) { setAdminFormError('Passwords do not match.'); return; }
    if (usersList.some(u => u?.loginId?.toLowerCase() === adminForm.loginId.toLowerCase())) { setAdminFormError('Login ID already exists.'); return; }
    const newAdmin = {
      loginId: adminForm.loginId,
      name: 'Admin - ' + adminForm.loginId,
      email: adminForm.loginId + '@assetflow.com',
      password: adminForm.password,
      role: 'System Administrator',
      position: 'System Administrator',
      mobile: '',
      address: '',
    };
    const updated = [newAdmin, ...usersList];
    setUsersList(updated);
    localStorage.setItem('assetflow_users', JSON.stringify(updated));
    setAdminFormSuccess('Admin account "' + adminForm.loginId + '" created successfully!');
    triggerConfettiBlast();
    setTimeout(() => { setIsAdminModalOpen(false); setAdminForm({ loginId:'', password:'', confirmPassword:'' }); setAdminFormSuccess(''); }, 1200);
  };

  const aff = (key) => (e) => setAdminForm(f => ({ ...f, [key]: e.target.value }));

  const getUserPhoto = (id) => {
    try { const s = localStorage.getItem('assetflow_profile_' + id); return s ? JSON.parse(s).photo || '' : ''; }
    catch { return ''; }
  };

  const ff = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  /* ══════════════════════════════════════
     RENDER
  ══════════════════════════════════════ */
  return (
    <div className="animated fadeIn" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ─── HEADER BAR ─── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px 12px', borderBottom:'1.5px solid rgba(207,142,109,0.13)', background:'rgba(255,255,255,0.55)', backdropFilter:'blur(12px)', flexWrap:'wrap', gap:'12px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" style={{width:'20px',height:'20px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize:'22px', fontWeight:'800', color:'var(--text-primary)', margin:0 }}>System Administrator Dashboard</h2>
            <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'2px 0 0 0' }}>Manage users, roles, and module-level permissions.</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
          {/* Settings */}
          <button onClick={() => setShowAdminSettings(v => !v)}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', borderRadius:'10px', border:'1.5px solid rgba(207,142,109,0.22)', background: showAdminSettings ? 'rgba(207,142,109,0.1)' : 'rgba(255,255,255,0.8)', cursor:'pointer', fontSize:'12px', fontWeight:'700', color:'var(--text-primary)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" style={{width:'14px',height:'14px'}}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>

          {/* Add User */}
          <button onClick={() => setIsAddModalOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'7px 16px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', cursor:'pointer', fontSize:'12px', fontWeight:'700', color:'#fff', boxShadow:'0 3px 12px rgba(207,142,109,0.35)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add User
          </button>
        </div>
      </div>

      {/* ─── ADMIN SETTINGS PANEL (collapsible) ─── */}
      {showAdminSettings && (
        <div style={{ background:'rgba(207,142,109,0.06)', borderBottom:'1.5px solid rgba(207,142,109,0.13)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', flexShrink:0 }}>
          <span style={{ fontSize:'13px', fontWeight:'700', color:'var(--text-primary)', whiteSpace:'nowrap' }}>🔐 Admin Creation Password:</span>
          <input type="text" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="Secret password for auto-admin"
            style={{ flex:'1', minWidth:'200px', height:'34px', borderRadius:'9px', border:'1.5px solid rgba(207,142,109,0.25)', padding:'0 12px', fontSize:'13px', outline:'none', background:'rgba(255,255,255,0.9)', color:'var(--text-primary)' }} />
          <button onClick={() => { localStorage.setItem('assetflow_admin_creation_password', adminPwd); alert('Saved!'); }}
            style={{ height:'34px', padding:'0 18px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', color:'#fff', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Save</button>
          <span style={{ fontSize:'11px', color:'var(--text-secondary)' }}>New users registering with this password are auto-promoted to System Administrator.</span>
        </div>
      )}

      {/* ═══ BODY: LEFT LIST + RIGHT PANEL ═══ */}
      <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

        {/* ─── LEFT: USER LIST ─── */}
        <div style={{ width:'280px', flexShrink:0, borderRight:'1.5px solid rgba(207,142,109,0.13)', display:'flex', flexDirection:'column', background:'rgba(255,255,255,0.45)', backdropFilter:'blur(8px)' }}>
          {/* Header */}
          <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid rgba(207,142,109,0.10)', flexShrink:0 }}>
            <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.08em', color:'var(--text-secondary)', textTransform:'uppercase', marginBottom:'10px' }}>
              Users ({filtered.length})
            </div>
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <div style={{ position:'relative', flex:1 }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" style={{ position:'absolute', left:'9px', top:'10px', width:'14px', height:'14px', color:'var(--text-secondary)', opacity:0.5, pointerEvents:'none' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Search user..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  style={{ width:'100%', height:'34px', borderRadius:'9px', border:'1.5px solid rgba(207,142,109,0.18)', padding:'0 10px 0 30px', fontSize:'12px', background:'rgba(255,255,255,0.8)', color:'var(--text-primary)', outline:'none', boxSizing:'border-box' }} />
              </div>
              <button onClick={() => setIsAddModalOpen(true)} title="Add User"
                style={{ width:'34px', height:'34px', borderRadius:'9px', border:'none', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(207,142,109,0.3)' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3" style={{width:'15px',height:'15px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
          </div>
          {/* User items */}
          <div style={{ flex:1, overflowY:'auto', padding:'6px 0' }}>
            {filtered.length === 0 && <div style={{ padding:'20px', textAlign:'center', color:'var(--text-secondary)', fontSize:'13px' }}>No users found.</div>}
            {filtered.map(u => {
              const isAdmin = u.role === 'System Administrator' || u.role === 'ADMIN';
              const sel = selectedUser?.loginId === u.loginId;
              const photo = getUserPhoto(u.loginId);
              return (
                <div key={u.loginId}
                  onClick={() => selectUser(u)}
                  style={{
                    display:'flex', alignItems:'center', gap:'11px', padding:'10px 16px', cursor:'pointer',
                    background: sel ? 'rgba(207,142,109,0.12)' : 'transparent',
                    borderLeft: sel ? '3px solid #CF8E6D' : '3px solid transparent',
                    transition:'all 0.15s',
                  }}
                >
                  <div style={{ width:'34px', height:'34px', borderRadius:'50%', background: avatarColor(u.name), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#fff', flexShrink:0, overflow:'hidden' }}>
                    {photo ? <img src={photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : initials(u.name)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:'600', color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name || u.loginId}</div>
                    <div style={{ fontSize:'11px', color: isAdmin ? '#CF8E6D' : 'var(--text-secondary)', marginTop:'1px' }}>{isAdmin ? '⭐ Admin' : (u.position || 'User')}</div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT PANEL ─── */}
        <div style={{ flex:1, overflow:'auto', padding:'22px 26px', display:'flex', flexDirection:'column', gap:'22px', minWidth:0 }}>



          {/* ═══ USER PROFILE + FIELD PERMISSIONS ═══ */}
          {!selectedUser && (
            <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'14px', color:'var(--text-secondary)', padding:'60px 0' }}>
              <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'rgba(207,142,109,0.10)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="#CF8E6D" strokeWidth="1.5" style={{width:'36px',height:'36px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <p style={{ fontSize:'15px', fontWeight:'600', margin:0, color:'var(--text-primary)' }}>Select a user to manage</p>
              <p style={{ fontSize:'13px', margin:0 }}>Click any user from the list on the left</p>
            </div>
          )}

          {selectedUser && (
            <>
              {/* ── Profile Card ── */}
              <div style={{ background:'rgba(255,255,255,0.7)', backdropFilter:'blur(10px)', borderRadius:'18px', border:'1.5px solid rgba(207,142,109,0.14)', boxShadow:'0 4px 24px rgba(78,59,49,0.06)', padding:'24px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'18px', flexWrap:'wrap', gap:'10px' }}>
                  <div>
                    <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'4px' }}>User Management Form View</div>
                    <div style={{ fontSize:'20px', fontWeight:'800', color:'var(--text-primary)' }}>{selectedUser.name}</div>
                  </div>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'11px', fontWeight:'700', color:'#CF8E6D', background:'rgba(207,142,109,0.10)', border:'1px solid rgba(207,142,109,0.22)', borderRadius:'6px', padding:'3px 9px' }}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{width:'11px',height:'11px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    read-only
                  </span>
                </div>

                <div style={{ display:'flex', gap:'24px', alignItems:'flex-start', flexWrap:'wrap' }}>
                  {/* Photo */}
                  <div style={{ width:'88px', height:'88px', borderRadius:'16px', background:'linear-gradient(135deg,rgba(207,142,109,0.12),rgba(160,104,58,0.12))', border:'2.5px solid rgba(207,142,109,0.22)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    {(() => { const p = getUserPhoto(selectedUser.loginId);
                      return p ? <img src={p} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:'26px',fontWeight:'800',color:'#CF8E6D'}}>{initials(selectedUser.name)}</span>;
                    })()}
                  </div>
                  {/* Fields */}
                  <div style={{ flex:1, minWidth:'200px' }}>
                    {[
                      { l:'Name :',          v: selectedUser.name },
                      { l:'Address :',       v: selectedUser.address || 'Not provided' },
                      { l:'Mobile Number :', v: selectedUser.mobile || 'Not provided' },
                      { l:'Email ID :',      v: selectedUser.email },
                    ].map(({l,v}) => (
                      <div key={l} style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'9px' }}>
                        <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--text-secondary)', minWidth:'140px', flexShrink:0 }}>{l}</span>
                        <span style={{ fontSize:'14px', fontWeight:'600', color:'var(--text-primary)' }}>{v}</span>
                      </div>
                    ))}
                    {/* Position (editable) */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                      <span style={{ fontSize:'13px', fontWeight:'600', color:'var(--text-secondary)', minWidth:'140px', flexShrink:0 }}>Position :</span>
                      <input value={editPosition} onChange={e => setEditPosition(e.target.value)} placeholder="Set position..."
                        style={{ fontSize:'14px', fontWeight:'600', color:'var(--text-primary)', border:'1.5px solid rgba(207,142,109,0.28)', borderRadius:'8px', padding:'5px 10px', background:'rgba(255,255,255,0.9)', outline:'none', flex:1 }} />
                      <button onClick={savePosition}
                        style={{ fontSize:'12px', fontWeight:'700', color:'#fff', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', border:'none', borderRadius:'7px', padding:'6px 14px', cursor:'pointer', boxShadow:'0 2px 8px rgba(207,142,109,0.3)', flexShrink:0 }}>
                        {positionSaved ? '✓ Saved' : 'Save'}
                      </button>
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(207,142,109,0.85)', fontStyle:'italic' }}>★ Only Position field is editable by System Administrator</div>
                  </div>
                </div>
              </div>

              {/* ── Field-Level Permission Matrix (tabbed) ── */}
              <div style={{ background:'rgba(255,255,255,0.7)', backdropFilter:'blur(10px)', borderRadius:'18px', border:'1.5px solid rgba(207,142,109,0.14)', boxShadow:'0 4px 24px rgba(78,59,49,0.06)', padding:'24px' }}>
                <div style={{ marginBottom:'16px' }}>
                  <div style={{ fontSize:'11px', fontWeight:'700', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-secondary)', marginBottom:'4px' }}>Field-Level Permissions</div>
                  <div style={{ fontSize:'16px', fontWeight:'700', color:'var(--text-primary)' }}>Access matrix for <span style={{color:'#CF8E6D'}}>{selectedUser.name}</span></div>
                </div>
                {/* Tabs */}
                <div style={{ display:'flex', gap:'4px', borderBottom:'2px solid rgba(207,142,109,0.13)', flexWrap:'wrap' }}>
                  {FIELD_TABS.map(t => (
                    <button key={t} onClick={() => setActiveFieldTab(t)}
                      style={{
                        padding:'8px 20px', fontSize:'13px', fontWeight:'700', border:'none', borderRadius:'10px 10px 0 0', cursor:'pointer',
                        background: activeFieldTab === t ? 'linear-gradient(135deg,#CF8E6D,#a0683a)' : 'transparent',
                        color: activeFieldTab === t ? '#fff' : 'var(--text-secondary)',
                        boxShadow: activeFieldTab === t ? '0 2px 10px rgba(207,142,109,0.25)' : 'none',
                        marginBottom:'-2px', borderBottom: activeFieldTab === t ? '2px solid #CF8E6D' : '2px solid transparent', transition:'all 0.15s',
                      }}>{t}</button>
                  ))}
                </div>
                {/* Table */}
                <div style={{ overflowX:'auto', borderRadius:'0 12px 12px 12px', border:'1.5px solid rgba(207,142,109,0.13)', borderTop:'2px solid #CF8E6D' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr style={{ background:'rgba(207,142,109,0.05)' }}>
                        <th style={{ textAlign:'left', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-secondary)', borderBottom:'2px solid rgba(207,142,109,0.13)' }}>Field</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-secondary)', borderBottom:'2px solid rgba(207,142,109,0.13)' }}>Create</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-secondary)', borderBottom:'2px solid rgba(207,142,109,0.13)' }}>View</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-secondary)', borderBottom:'2px solid rgba(207,142,109,0.13)' }}>Edit</th>
                        <th style={{ textAlign:'center', padding:'10px 14px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--text-secondary)', borderBottom:'2px solid rgba(207,142,109,0.13)' }}>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(FIELD_PERMS[activeFieldTab] || []).map((row, i) => (
                        <tr key={i} style={{ background: i%2===0 ? 'transparent' : 'rgba(207,142,109,0.025)' }}>
                          <td style={{ padding:'9px 14px', fontWeight:'600', color:'var(--text-primary)', borderBottom:'1px solid rgba(207,142,109,0.07)' }}>{row.field}</td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(207,142,109,0.07)' }}><PermCell val={row.create} /></td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(207,142,109,0.07)' }}><PermCell val={row.view} /></td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(207,142,109,0.07)' }}><PermCell val={row.edit} /></td>
                          <td style={{ textAlign:'center', padding:'9px 14px', borderBottom:'1px solid rgba(207,142,109,0.07)' }}><PermCell val={row.del} /></td>
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
        <div style={{ position:'fixed', inset:0, background:'rgba(40,28,20,0.50)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}
          onClick={() => setIsAddModalOpen(false)}>
          <div style={{ background:'rgba(255,255,255,0.97)', borderRadius:'22px', padding:'34px', width:'100%', maxWidth:'480px', maxHeight:'90vh', overflowY:'auto', position:'relative', boxShadow:'0 30px 80px rgba(0,0,0,0.22)', border:'1.5px solid rgba(207,142,109,0.18)' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { setIsAddModalOpen(false); setFormError(''); setFormSuccess(''); }}
              style={{ position:'absolute', top:'18px', right:'18px', background:'none', border:'none', fontSize:'22px', color:'var(--text-secondary)', cursor:'pointer' }}>&times;</button>

            <div style={{ textAlign:'center', marginBottom:'22px' }}>
              <div style={{ width:'50px', height:'50px', borderRadius:'14px', background:'linear-gradient(135deg,#CF8E6D,#a0683a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" style={{width:'24px',height:'24px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              </div>
              <h3 style={{ margin:0, fontSize:'20px', fontWeight:'800', color:'var(--text-primary)' }}>Register System User</h3>
              <p style={{ margin:'5px 0 0', fontSize:'13px', color:'var(--text-secondary)' }}>Create login credentials for a new employee.</p>
            </div>

            <form onSubmit={handleAddUser} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
              {[
                { label:'Login ID *',  key:'loginId',  type:'text',     ph:'6–12 char username' },
                { label:'Full Name *', key:'name',     type:'text',     ph:'Employee full name' },
                { label:'Email *',     key:'email',    type:'email',    ph:'employee@mail.com' },
                { label:'Mobile',      key:'mobile',   type:'text',     ph:'+91 XXXXXXXXXX' },
                { label:'Address',     key:'address',  type:'text',     ph:'City, State, PIN' },
                { label:'Password *',  key:'password', type:'password', ph:'Secure password' },
                { label:'Position',    key:'position', type:'text',     ph:'e.g. Sales Manager' },
              ].map(({label,key,type,ph}) => (
                <div key={key}>
                  <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text-secondary)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</label>
                  <input type={type} value={form[key]} onChange={ff(key)} placeholder={ph}
                    style={{ width:'100%', height:'40px', borderRadius:'10px', border:'1.5px solid rgba(207,142,109,0.22)', padding:'0 12px', fontSize:'13px', outline:'none', background:'rgba(255,255,255,0.9)', color:'var(--text-primary)', boxSizing:'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text-secondary)', display:'block', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Role</label>
                <select value={form.role} onChange={ff('role')}
                  style={{ width:'100%', height:'40px', borderRadius:'10px', border:'1.5px solid rgba(207,142,109,0.22)', padding:'0 12px', fontSize:'13px', outline:'none', background:'rgba(255,255,255,0.9)', color:'var(--text-primary)' }}>
                  <option value="User">User (Standard access)</option>
                  <option value="System Administrator">System Administrator (Full access)</option>
                </select>
              </div>
              {formError   && <div style={{ background:'rgba(166,94,85,0.10)', border:'1px solid rgba(166,94,85,0.25)', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#A65E55', fontWeight:'600' }}>{formError}</div>}
              {formSuccess && <div style={{ background:'rgba(93,112,82,0.10)', border:'1px solid rgba(93,112,82,0.25)', borderRadius:'8px', padding:'10px 12px', fontSize:'12px', color:'#5D7052', fontWeight:'600' }}>{formSuccess}</div>}
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
        <div style={{ position:'fixed', inset:0, background:'rgba(40,28,20,0.55)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000 }}
          onClick={() => setIsAdminModalOpen(false)}>
          <div style={{ background:'rgba(255,255,255,0.97)', borderRadius:'22px', padding:'38px', width:'100%', maxWidth:'420px', position:'relative', boxShadow:'0 30px 80px rgba(0,0,0,0.25)', border:'2px solid rgba(212,175,55,0.25)' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { setIsAdminModalOpen(false); setAdminFormError(''); setAdminFormSuccess(''); }}
              style={{ position:'absolute', top:'18px', right:'18px', background:'none', border:'none', fontSize:'22px', color:'var(--text-secondary)', cursor:'pointer' }}>&times;</button>

            <div style={{ textAlign:'center', marginBottom:'26px' }}>
              <div style={{ width:'60px', height:'60px', borderRadius:'50%', background:'linear-gradient(135deg,#d4af37,#a0683a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 4px 20px rgba(212,175,55,0.35)' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" style={{width:'28px',height:'28px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 style={{ margin:0, fontSize:'22px', fontWeight:'800', color:'var(--text-primary)' }}>Create Admin Account</h3>
              <p style={{ margin:'6px 0 0', fontSize:'13px', color:'var(--text-secondary)' }}>Only System Administrators can create new admin accounts.<br/>The created admin will have full dashboard access.</p>
            </div>

            <form onSubmit={handleCreateAdmin} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text-secondary)', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Admin Login ID *</label>
                <input type="text" value={adminForm.loginId} onChange={aff('loginId')} placeholder="e.g. admin_ravi"
                  style={{ width:'100%', height:'44px', borderRadius:'11px', border:'1.5px solid rgba(212,175,55,0.3)', padding:'0 14px', fontSize:'14px', outline:'none', background:'rgba(255,255,255,0.95)', color:'var(--text-primary)', boxSizing:'border-box', transition:'border 0.2s' }} />
              </div>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text-secondary)', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Password *</label>
                <input type="password" value={adminForm.password} onChange={aff('password')} placeholder="Minimum 6 characters"
                  style={{ width:'100%', height:'44px', borderRadius:'11px', border:'1.5px solid rgba(212,175,55,0.3)', padding:'0 14px', fontSize:'14px', outline:'none', background:'rgba(255,255,255,0.95)', color:'var(--text-primary)', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:'11px', fontWeight:'700', color:'var(--text-secondary)', display:'block', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Confirm Password *</label>
                <input type="password" value={adminForm.confirmPassword} onChange={aff('confirmPassword')} placeholder="Re-enter password"
                  style={{ width:'100%', height:'44px', borderRadius:'11px', border:'1.5px solid rgba(212,175,55,0.3)', padding:'0 14px', fontSize:'14px', outline:'none', background:'rgba(255,255,255,0.95)', color:'var(--text-primary)', boxSizing:'border-box' }} />
              </div>
              {adminFormError   && <div style={{ background:'rgba(166,94,85,0.10)', border:'1px solid rgba(166,94,85,0.25)', borderRadius:'9px', padding:'10px 14px', fontSize:'12px', color:'#A65E55', fontWeight:'600' }}>{adminFormError}</div>}
              {adminFormSuccess && <div style={{ background:'rgba(93,112,82,0.10)', border:'1px solid rgba(93,112,82,0.25)', borderRadius:'9px', padding:'10px 14px', fontSize:'12px', color:'#5D7052', fontWeight:'600' }}>🛡️ {adminFormSuccess}</div>}
              <button type="submit"
                style={{ marginTop:'6px', height:'48px', borderRadius:'13px', border:'none', background:'linear-gradient(135deg,#d4af37,#a0683a)', color:'#fff', fontWeight:'800', fontSize:'15px', cursor:'pointer', letterSpacing:'0.06em', boxShadow:'0 6px 24px rgba(212,175,55,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.5" style={{width:'18px',height:'18px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                CREATE ADMIN ACCOUNT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
