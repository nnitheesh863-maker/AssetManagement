import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API = 'http://127.0.0.1:5000/api';

const STATUS_COLORS = {
  Draft:               { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
  Confirmed:           { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  'Partially Received':{ bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
  'Fully Received':    { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  Received:            { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  Cancelled:           { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
};
const VENDOR_STATUS_COLORS = {
  Active:      { bg: '#d1fae5', color: '#059669' },
  Inactive:    { bg: '#f3f4f6', color: '#6b7280' },
  Blacklisted: { bg: '#fee2e2', color: '#dc2626' },
};

const cardV = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } };
const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('assetflow_token');
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(opts.headers || {}) }
  });
}

// ─────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, subColor = '#6b7280', accent, onClick }) {
  return (
    <motion.div variants={cardV} whileHover={{ scale: 1.025, y: -3 }} onClick={onClick}
      style={{
        background: accent ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'var(--card-bg)',
        border: accent ? 'none' : '1px solid var(--card-border)',
        borderRadius: 16, padding: '20px 22px', cursor: onClick ? 'pointer' : 'default',
        boxShadow: accent ? '0 8px 24px rgba(59,130,246,0.35)' : '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: accent ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: accent ? '#fff' : 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.75)' : subColor }}>{sub}</div>}
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
      {status}
    </span>
  );
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 36, height: 36, border: '3px solid var(--card-border)', borderTopColor: '#3b82f6', borderRadius: '50%' }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// MINI LINE CHART (SVG)
// ─────────────────────────────────────────────
function MiniChart({ data, filter, onFilter }) {
  const points = filter === '7' ? data.slice(-7) : data;
  if (!points?.length) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No data yet</div>;
  const max = Math.max(...points.map(p => p.total), 1);
  const W = 520, H = 110;
  const step = W / (points.length - 1 || 1);
  const pts = points.map((p, i) => ({ x: i * step, y: H - (p.total / max) * H * 0.85 - 8, label: p.label, total: p.total }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['7', '30'].map(f => (
          <button key={f} onClick={() => onFilter(f)} style={{ padding: '4px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: filter === f ? '#3b82f6' : 'var(--card-border)', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>
            {f === '7' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 110 }}>
        <defs>
          <linearGradient id="poGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#poGrad)" />
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#3b82f6" />
            {i % Math.ceil(pts.length / 7) === 0 && <text x={p.x} y={H} textAnchor="middle" fontSize="9" fill="#8E7E73">{p.label}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────
function DonutChart({ counts }) {
  const data = [
    { label: 'Draft', count: counts.Draft || 0, color: '#9ca3af' },
    { label: 'Confirmed', count: counts.Confirmed || 0, color: '#3b82f6' },
    { label: 'Part. Received', count: counts['Partially Received'] || 0, color: '#f59e0b' },
    { label: 'Fully Received', count: counts['Fully Received'] || 0, color: '#10b981' },
    { label: 'Cancelled', count: counts.Cancelled || 0, color: '#ef4444' },
  ].filter(d => d.count > 0);
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No orders yet</div>;
  let cumulative = 0;
  const r = 40, cx = 55, cy = 55, strokeW = 16, circumference = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
        {data.map((d, i) => {
          const pct = d.count / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const offset = circumference * (1 - cumulative);
          cumulative += pct;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={strokeW}
            strokeDasharray={dashArray} strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.6s ease' }} />;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--text-primary)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">ORDERS</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{d.label}</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PURCHASE DASHBOARD TAB
// ─────────────────────────────────────────────
function PurchaseDashboard({ onNavigateToOrders }) {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState('7');

  useEffect(() => {
    apiFetch('/purchase/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDash(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!dash) return <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 60 }}>Could not load dashboard data.</div>;

  const { kpis = {}, statusCounts = {}, purchaseTrend7 = [], purchaseTrend30 = [], vendorPerformance = [], recentOrders = [], lowStockItems = [] } = dash;

  return (
    <motion.div variants={containerV} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <KpiCard icon="💳" label="Total Purchase Value" accent
          value={`₹${(kpis.totalPurchaseValue || 0).toLocaleString('en-IN')}`}
          sub="Confirmed + Received orders" />
        <KpiCard icon="📋" label="Total POs" value={kpis.totalOrders || 0}
          sub={`${kpis.draftOrders || 0} Draft · ${kpis.completedOrders || 0} Done`}
          onClick={onNavigateToOrders} />
        <KpiCard icon="🚚" label="Pending Deliveries" value={kpis.pendingDeliveries || 0}
          sub="Awaiting supplier" subColor="#d97706" />
        <KpiCard icon="🏭" label="Active Vendors" value={kpis.activeVendors || 0}
          sub="Registered suppliers" />
        <KpiCard icon="⚠️" label="Low Stock Alerts" value={kpis.lowStockAlerts || 0}
          sub="Need purchase" subColor="#dc2626" />
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22 }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>📈 Purchase Trend</h4>
          <MiniChart data={chartFilter === '7' ? purchaseTrend7 : purchaseTrend30} filter={chartFilter} onFilter={setChartFilter} />
        </motion.div>
        <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22 }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>🍩 Order Status</h4>
          <DonutChart counts={statusCounts} />
        </motion.div>
      </div>

      {/* RECENT ORDERS + VENDOR PERFORMANCE + LOW STOCK */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22, overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>🕐 Recent Purchase Orders</h4>
            <button onClick={onNavigateToOrders} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View All →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['PO #', 'Vendor', 'Item', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No orders yet</td></tr>
              ) : recentOrders.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6', fontSize: 12 }}>{o.id}</td>
                  <td style={{ padding: '8px', fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.vendor}</td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.item || '—'}</td>
                  <td style={{ padding: '8px', fontWeight: 700 }}>₹{(o.total || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '8px' }}><StatusBadge status={o.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* VENDOR PERFORMANCE */}
          <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 20 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>🏭 Vendor Performance</h4>
            {vendorPerformance.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 16 }}>No vendor data</div>
            ) : vendorPerformance.map((v, i) => {
              const rate = v.orders > 0 ? Math.round((v.completed / v.orders) * 100) : 0;
              return (
                <div key={v.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</span>
                    <span style={{ color: rate >= 70 ? '#059669' : '#d97706', fontWeight: 700 }}>{rate}%</span>
                  </div>
                  <div style={{ background: 'var(--card-border)', borderRadius: 4, height: 5 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${rate}%` }} transition={{ duration: 0.7, delay: i * 0.1 }}
                      style={{ height: '100%', background: rate >= 70 ? '#10b981' : '#f59e0b', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* LOW STOCK ALERTS */}
          {lowStockItems.length > 0 && (
            <motion.div variants={cardV} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 18 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#dc2626' }}>⚠️ Low Stock — Purchase Needed</h4>
              {lowStockItems.slice(0, 4).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, padding: '6px 0', borderBottom: '1px solid #fecaca' }}>
                  <span style={{ fontWeight: 600, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>Shortage: {item.shortage}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// VENDOR FORM MODAL
// ─────────────────────────────────────────────
function VendorFormModal({ vendor, onClose, onSaved }) {
  const isNew = !vendor;
  const [form, setForm] = useState({
    company_name: vendor?.company_name || '',
    contact_person: vendor?.contact_person || '',
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    address: vendor?.address || '',
    gst_number: vendor?.gst_number || '',
    payment_terms: vendor?.payment_terms || 'Net 30',
    status: vendor?.status || 'Active',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.company_name.trim()) { toast.error('Company name required'); return; }
    setSaving(true);
    try {
      let res;
      if (isNew) {
        res = await apiFetch('/vendors', { method: 'POST', body: JSON.stringify(form) });
      } else {
        res = await apiFetch(`/vendors/${vendor.vendor_code}`, { method: 'PUT', body: JSON.stringify(form) });
      }
      const data = await res.json();
      if (data.success !== false) {
        toast.success(isNew ? 'Vendor created!' : 'Vendor updated!');
        onSaved();
      } else {
        toast.error(data.message || 'Failed');
      }
    } catch { toast.error('Server unreachable'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--card-border)', paddingBottom: 16 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{isNew ? 'Add New Vendor' : `Edit ${vendor.company_name}`}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Company Name *</label>
              <input className="filter-control-input" value={form.company_name} onChange={e => set('company_name', e.target.value)} required style={{ width: '100%', fontSize: 15 }} />
            </div>
            {[['Contact Person', 'contact_person'], ['Phone', 'phone'], ['Email', 'email'], ['GST Number', 'gst_number']].map(([label, key]) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</label>
                <input className="filter-control-input" value={form[key]} onChange={e => set(key, e.target.value)} style={{ width: '100%' }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Payment Terms</label>
              <select className="filter-control-select" value={form.payment_terms} onChange={e => set('payment_terms', e.target.value)} style={{ width: '100%' }}>
                {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Advance', 'COD'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {!isNew && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Status</label>
                <select className="filter-control-select" value={form.status} onChange={e => set('status', e.target.value)} style={{ width: '100%' }}>
                  {['Active', 'Inactive', 'Blacklisted'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Address</label>
              <input className="filter-control-input" value={form.address} onChange={e => set('address', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--card-border)' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {saving ? 'Saving...' : isNew ? 'Create Vendor' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--card-border)', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// VENDORS TAB
// ─────────────────────────────────────────────
function VendorsTab({ currentUser }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | vendor object

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const canEdit = isAdmin || currentUser?.role === 'PURCHASE_USER';

  const fetchVendors = useCallback(() => {
    setLoading(true);
    apiFetch('/vendors').then(r => r.ok ? r.json() : []).then(d => { setVendors(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleDelete = async (vendorCode) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await apiFetch(`/vendors/${vendorCode}`, { method: 'DELETE' });
      toast.success('Vendor deleted');
      fetchVendors();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = vendors.filter(v => !search || v.company_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {modal && (
        <VendorFormModal
          vendor={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchVendors(); }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <input className="filter-control-input" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} vendors</span>
          {canEdit && (
            <button onClick={() => setModal('new')} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              + Add Vendor
            </button>
          )}
        </div>
      </div>
      <div className="sf-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="sf-table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              {['Vendor ID', 'Company Name', 'Contact', 'Phone', 'Email', 'GST No.', 'Payment Terms', 'Orders', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }}><Spinner /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No vendors found. Add your first vendor!</td></tr>
            ) : filtered.map((v, i) => {
              const vs = VENDOR_STATUS_COLORS[v.status] || VENDOR_STATUS_COLORS.Active;
              return (
                <motion.tr key={v.vendor_code} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="sf-table-row-hover">
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6', fontSize: 12 }}>{v.vendor_code}</td>
                  <td style={{ fontWeight: 700 }}>{v.company_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.contact_person || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.phone || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{v.email || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 12 }}>{v.gst_number || '—'}</td>
                  <td>{v.payment_terms || 'Net 30'}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>{v.total_orders || 0}</td>
                  <td><span style={{ background: vs.bg, color: vs.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{v.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {canEdit && <button className="sf-btn" onClick={() => setModal(v)}>Edit</button>}
                      {canEdit && <button onClick={() => handleDelete(v.vendor_code)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Del</button>}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// GOODS RECEIPT MODAL
// ─────────────────────────────────────────────
function GoodsReceiptModal({ order, onClose, onReceived }) {
  const totalOrdered = order.qty || (order.items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0);
  const [receiptItems, setReceiptItems] = useState([{
    materialName: order.item || (order.items?.[0]?.materialName || ''),
    orderedQty: totalOrdered,
    receivedQty: totalOrdered,
    damagedQty: 0,
    qualityStatus: 'Accepted'
  }]);
  const [qualityStatus, setQualityStatus] = useState('Accepted');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const updateItem = (i, field, val) => setReceiptItems(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n; });

  const handleReceive = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/purchase-orders/${order.id}/receive`, {
        method: 'POST',
        body: JSON.stringify({ receiptItems, notes, qualityStatus })
      });
      const data = await res.json();
      if (data.success !== false) {
        toast.success(`Goods received! ${data.message}`, { icon: '📦' });
        onReceived();
      } else {
        toast.error(data.message || 'Failed to receive goods');
      }
    } catch { toast.error('Server unreachable'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 620, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--card-border)', paddingBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>📦 Receive Goods</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>PO: {order.id} · Vendor: {order.vendor}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <form onSubmit={handleReceive} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {receiptItems.map((item, i) => (
            <div key={i} style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: 12, padding: 18 }}>
              <h5 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Material: {item.materialName}</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[['Ordered Qty', 'orderedQty', true], ['Received Qty', 'receivedQty', false], ['Damaged Qty', 'damagedQty', false]].map(([label, field, ro]) => (
                  <div key={field}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
                    <input type="number" className="filter-control-input" value={item[field]} readOnly={ro}
                      onChange={e => !ro && updateItem(i, field, Math.max(0, parseInt(e.target.value) || 0))}
                      style={{ width: '100%', background: ro ? 'rgba(0,0,0,0.04)' : undefined }} />
                  </div>
                ))}
              </div>
              {item.damagedQty > 0 && (
                <div style={{ marginTop: 8, padding: '6px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 12, color: '#c2410c', fontWeight: 600 }}>
                  ⚠️ {item.damagedQty} units damaged. Only {item.receivedQty - item.damagedQty} units will be added to stock.
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Quality Status</label>
              <select className="filter-control-select" value={qualityStatus} onChange={e => setQualityStatus(e.target.value)} style={{ width: '100%' }}>
                {['Accepted', 'Partially Accepted', 'Rejected'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Notes</label>
              <input className="filter-control-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional remarks..." style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--card-border)' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {saving ? 'Processing...' : '✅ Confirm Receipt & Update Inventory'}
            </button>
            <button type="button" onClick={onClose} style={{ background: 'var(--card-border)', border: 'none', borderRadius: 8, padding: '11px 18px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ORDER FORM
// ─────────────────────────────────────────────
function PurchaseOrderForm({ order, vendors, products, currentUser, onSave, onBack }) {
  const isNew = !order;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const canEdit = isAdmin || currentUser?.role === 'PURCHASE_USER';
  const status = order?.status || 'Draft';
  const isLocked = ['Fully Received', 'Cancelled'].includes(status);
  const isConfirmed = status === 'Confirmed' || status === 'Partially Received';

  const [vendorName, setVendorName] = useState(order?.vendor || '');
  const [address, setAddress] = useState(order?.address || '');
  const [responsible, setResponsible] = useState(order?.responsible || currentUser?.name || '');
  const [orderDate, setOrderDate] = useState(order?.date || new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(order?.expected_date || '');
  const [paymentTerms, setPaymentTerms] = useState(order?.payment_terms || 'Net 30');
  const [notes, setNotes] = useState(order?.notes || '');
  const [curStatus, setCurStatus] = useState(status);
  const [receiptModal, setReceiptModal] = useState(false);

  const [items, setItems] = useState(
    order?.items?.length
      ? order.items
      : [{ materialName: order?.item || products[0]?.name || '', quantity: order?.qty || 1, unitPrice: 0, unit: 'Units' }]
  );
  const [saving, setSaving] = useState(false);

  const updateItem = (i, field, val) => {
    setItems(prev => { const n = [...prev]; n[i] = { ...n[i], [field]: val }; return n; });
  };
  const addItem = () => setItems(p => [...p, { materialName: products[0]?.name || '', quantity: 1, unitPrice: 0, unit: 'Units' }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  const total = items.reduce((s, it) => s + ((it.quantity || 0) * (it.unitPrice || 0)), 0);

  const handleSave = async (e, newStatus) => {
    e && e.preventDefault();
    if (!vendorName.trim()) { toast.error('Vendor name required'); return; }
    setSaving(true);
    const saveStatus = newStatus || curStatus;
    const body = {
      date: orderDate, vendor: vendorName, address, responsible,
      item: items[0]?.materialName || '', qty: items[0]?.quantity || 0,
      items, total, expected_date: expectedDate, payment_terms: paymentTerms,
      notes, status: saveStatus, owner: order?.owner || currentUser?.login_id || ''
    };
    try {
      let res;
      if (isNew) res = await apiFetch('/purchase-orders', { method: 'POST', body: JSON.stringify(body) });
      else res = await apiFetch(`/purchase-orders/${order.id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success !== false) {
        toast.success(isNew ? 'Purchase order created!' : 'Order saved!', { icon: '✅' });
        onSave();
      } else toast.error(data.message || 'Failed');
    } catch { toast.error('Server unreachable'); }
    finally { setSaving(false); }
  };

  return (
    <>
      {receiptModal && <GoodsReceiptModal order={{ ...order, vendor: vendorName, item: items[0]?.materialName, qty: items[0]?.quantity, items }} onClose={() => setReceiptModal(false)} onReceived={() => { setReceiptModal(false); onSave(); }} />}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--card-border)', paddingBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{isNew ? 'New Purchase Order' : `Edit ${order.id}`}</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{isNew ? 'Fill in order details' : `Status: ${curStatus}`}</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <StatusBadge status={curStatus} />
            <button onClick={onBack} style={{ background: 'var(--card-border)', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>← Back</button>
          </div>
        </div>

        <form onSubmit={e => handleSave(e)} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* VENDOR INFO */}
          <div>
            <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>🏭 Vendor Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Vendor Name *</label>
                {vendors.length > 0 ? (
                  <select className="filter-control-select" value={vendorName} onChange={e => {
                    const v = vendors.find(v => v.company_name === e.target.value);
                    setVendorName(e.target.value);
                    if (v) { setAddress(v.address || ''); setPaymentTerms(v.payment_terms || 'Net 30'); }
                  }} disabled={!canEdit || isLocked || isConfirmed} style={{ width: '100%', fontSize: 15 }}>
                    <option value="">— Select Vendor —</option>
                    {vendors.map(v => <option key={v.vendor_code} value={v.company_name}>{v.company_name}</option>)}
                  </select>
                ) : (
                  <input className="filter-control-input" value={vendorName} onChange={e => setVendorName(e.target.value)} disabled={!canEdit || isLocked || isConfirmed} style={{ width: '100%', fontSize: 15 }} placeholder="Enter vendor name" />
                )}
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Vendor Address</label>
                <input className="filter-control-input" value={address} onChange={e => setAddress(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Payment Terms</label>
                <select className="filter-control-select" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }}>
                  {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Advance', 'COD'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Responsible Person</label>
                <input className="filter-control-input" value={responsible} onChange={e => setResponsible(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Order Date</label>
                <input type="date" className="filter-control-input" value={orderDate} onChange={e => setOrderDate(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Expected Delivery Date</label>
                <input type="date" className="filter-control-input" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>📦 Materials / Items</h4>
              {canEdit && !isLocked && !isConfirmed && (
                <button type="button" onClick={addItem} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>+ Add Item</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end', background: '#fafafa', border: '1px solid var(--card-border)', borderRadius: 10, padding: '12px 14px' }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Material Name</label>
                    {products.length > 0 ? (
                      <select className="filter-control-select" value={item.materialName} onChange={e => updateItem(i, 'materialName', e.target.value)} disabled={!canEdit || isLocked || isConfirmed} style={{ width: '100%' }}>
                        {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    ) : (
                      <input className="filter-control-input" value={item.materialName} onChange={e => updateItem(i, 'materialName', e.target.value)} disabled={!canEdit || isLocked || isConfirmed} style={{ width: '100%' }} />
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Quantity</label>
                    <input type="number" className="filter-control-input" value={item.quantity} onChange={e => updateItem(i, 'quantity', Math.max(1, parseInt(e.target.value) || 1))} disabled={!canEdit || isLocked || isConfirmed} min={1} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Unit</label>
                    <select className="filter-control-select" value={item.unit || 'Units'} onChange={e => updateItem(i, 'unit', e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }}>
                      {['Units', 'Kg', 'Tons', 'Litres', 'Meters', 'Sq. Ft', 'Pcs'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Unit Price (₹)</label>
                    <input type="number" className="filter-control-input" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} disabled={!canEdit || isLocked} min={0} style={{ width: '100%' }} />
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Sub: ₹{((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  {canEdit && !isLocked && !isConfirmed && items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: 14 }}>✕</button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* NOTES + TOTAL */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 14, alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Notes / Remarks</label>
                <input className="filter-control-input" value={notes} onChange={e => setNotes(e.target.value)} disabled={!canEdit || isLocked} placeholder="Any special instructions..." style={{ width: '100%' }} />
              </div>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', borderRadius: 10, padding: '14px 20px', textAlign: 'right' }}>
                <div style={{ fontSize: 11, opacity: 0.85 }}>TOTAL PURCHASE VALUE</div>
                <div style={{ fontSize: 26, fontWeight: 900 }}>₹{total.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          {canEdit && (
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {!isLocked && (
                <button type="submit" disabled={saving} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  {saving ? 'Saving...' : isNew ? 'Create PO' : 'Save Draft'}
                </button>
              )}
              {curStatus === 'Draft' && !isNew && (
                <button type="button" disabled={saving} onClick={async (e) => { e.preventDefault(); await handleSave(e, 'Confirmed'); setCurStatus('Confirmed'); }}
                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  ✅ Confirm Order
                </button>
              )}
              {(curStatus === 'Confirmed' || curStatus === 'Partially Received') && (
                <button type="button" disabled={saving} onClick={() => setReceiptModal(true)}
                  style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  📦 Receive Goods
                </button>
              )}
              {!['Fully Received', 'Cancelled'].includes(curStatus) && (
                <button type="button" disabled={saving} onClick={async (e) => {
                  e.preventDefault();
                  if (!window.confirm('Cancel this purchase order?')) return;
                  await handleSave(e, 'Cancelled'); setCurStatus('Cancelled');
                }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Cancel PO
                </button>
              )}
            </div>
          )}
        </form>
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────
// PURCHASE ORDERS TAB
// ─────────────────────────────────────────────
function PurchaseOrdersTab({ currentUser, vendors, products }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [receiptModal, setReceiptModal] = useState(null);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const canEdit = isAdmin || currentUser?.role === 'PURCHASE_USER';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/purchase-orders');
      if (res.ok) setOrders(await res.json());
    } catch { toast.error('Failed to load orders'); }
    setLoading(false);
  }, []);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (view === 'form') return (
    <PurchaseOrderForm order={selected} vendors={vendors} products={products} currentUser={currentUser}
      onSave={() => { setView('list'); fetchOrders(); }} onBack={() => setView('list')} />
  );

  const statuses = ['All', 'Draft', 'Confirmed', 'Partially Received', 'Fully Received', 'Cancelled'];
  const filtered = orders.filter(o => {
    const matchSearch = !search || o.id?.toLowerCase().includes(search.toLowerCase()) || (o.vendor || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {receiptModal && (
        <GoodsReceiptModal order={receiptModal} onClose={() => setReceiptModal(null)} onReceived={() => { setReceiptModal(null); fetchOrders(); }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['list', 'kanban'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: view === v ? '#3b82f6' : 'var(--card-border)', color: view === v ? '#fff' : 'var(--text-primary)' }}>
              {v === 'list' ? '☰ List' : '⬛ Kanban'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="filter-control-input" placeholder="Search PO, vendor..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          <select className="filter-control-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 170 }}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          {canEdit && (
            <button onClick={() => { setSelected(null); setView('form'); }} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>
              + New PO
            </button>
          )}
        </div>
      </div>

      {loading ? <Spinner /> : view === 'list' ? (
        <div className="sf-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sf-table-wrapper">
            <table className="sf-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  {['PO #', 'Date', 'Vendor', 'Item', 'Qty', 'Total', 'Expected', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No purchase orders found</td></tr>
                ) : filtered.map((o, i) => (
                  <motion.tr key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="sf-table-row-hover">
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#3b82f6', fontSize: 12 }}>{o.id}</td>
                    <td>{o.date}</td>
                    <td style={{ fontWeight: 600, maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.vendor}</td>
                    <td style={{ color: 'var(--text-secondary)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.item || (o.items?.[0]?.materialName) || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{o.qty || o.items?.[0]?.quantity || '—'}</td>
                    <td style={{ fontWeight: 700 }}>₹{(o.total || 0).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{o.expected_date || '—'}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="sf-btn" onClick={() => { setSelected(o); setView('form'); }}>Manage</button>
                        {(o.status === 'Confirmed' || o.status === 'Partially Received') && canEdit && (
                          <button onClick={() => setReceiptModal(o)} style={{ background: '#d1fae5', color: '#059669', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>📦 Recv</button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 20px', fontSize: 12, color: 'var(--text-secondary)', borderTop: '1px solid var(--card-border)' }}>
            Showing {filtered.length} of {orders.length} orders
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, alignItems: 'start' }}>
          {['Draft', 'Confirmed', 'Partially Received', 'Fully Received', 'Cancelled'].map(col => {
            const colOrders = filtered.filter(o => o.status === col);
            const colors = STATUS_COLORS[col] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
            return (
              <div key={col} className="sf-panel" style={{ padding: 14, minHeight: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.color, background: colors.bg, border: `1px solid ${colors.border}`, padding: '3px 10px', borderRadius: 20 }}>{col}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{colOrders.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colOrders.map(o => (
                    <motion.div key={o.id} whileHover={{ scale: 1.02, y: -2 }} onClick={() => { setSelected(o); setView('form'); }}
                      style={{ background: 'var(--bg-dark)', border: '1px solid var(--card-border)', borderRadius: 10, padding: 12, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace', fontSize: 12 }}>{o.id}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{o.date}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.vendor}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.item || o.items?.[0]?.materialName || '—'}</div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>₹{(o.total || 0).toLocaleString('en-IN')}</div>
                    </motion.div>
                  ))}
                  {colOrders.length === 0 && <div style={{ padding: 16, border: '1px dashed var(--card-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function PurchaseOrders({ onNavigate, currentUser }) {
  const role = currentUser?.role || 'PENDING';
  const isAdmin = role === 'ADMIN' || role === 'System Administrator';
  const isPurchase = role === 'PURCHASE_USER';
  const isOwner = role === 'BUSINESS_OWNER';
  const hasAccess = isAdmin || isPurchase || isOwner;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!hasAccess) return;
    apiFetch('/vendors').then(r => r.ok ? r.json() : []).then(setVendors).catch(() => {});
    apiFetch('/products').then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {});
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 60, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 32 }}>🔒</div>
        <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800 }}>Purchase Module — Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, fontSize: 14, lineHeight: 1.6 }}>
          Your current role (<strong>{role}</strong>) does not have access to the Purchase module.
          Please contact your System Administrator to be assigned the <strong>Purchase User</strong> role.
        </p>
        <button onClick={() => onNavigate('dashboard')} style={{ marginTop: 24, background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'orders', label: '📋 Purchase Orders' },
    { id: 'vendors', label: '🏭 Vendors' },
  ];

  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>Purchase Module</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage vendors, purchase orders, goods receipts and material procurement
          </p>
        </div>
        <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid #93c5fd' }}>
          🔵 ERP Connected
        </span>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--card-border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', fontSize: 14, fontWeight: 700,
              color: activeTab === tab.id ? '#3b82f6' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.2s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === 'dashboard' && <PurchaseDashboard onNavigateToOrders={() => setActiveTab('orders')} />}
          {activeTab === 'orders' && <PurchaseOrdersTab currentUser={currentUser} vendors={vendors} products={products} />}
          {activeTab === 'vendors' && <VendorsTab currentUser={currentUser} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default PurchaseOrders;
