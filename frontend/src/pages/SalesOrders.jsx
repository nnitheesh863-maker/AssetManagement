import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API = 'http://127.0.0.1:5000/api';

const STATUS_COLORS = {
  Draft: { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
  Confirmed: { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  'Partially Delivered': { bg: '#fef3c7', color: '#d97706', border: '#fcd34d' },
  Delivered: { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  'Fully Delivered': { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  Cancelled: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('assetflow_token');
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(opts.headers || {}) }
  });
}

// ──────────────────────────────────────────
// KPI CARD
// ──────────────────────────────────────────
function KpiCard({ icon, label, value, sub, subColor = '#6b7280', accent = false, onClick }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.025, y: -3 }}
      onClick={onClick}
      style={{
        background: accent ? 'linear-gradient(135deg, #CF8E6D 0%, #a0614a 100%)' : 'var(--card-bg)',
        border: accent ? 'none' : '1px solid var(--card-border)',
        borderRadius: 16, padding: '20px 22px', cursor: onClick ? 'pointer' : 'default',
        boxShadow: accent ? '0 8px 24px rgba(207,142,109,0.35)' : '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: accent ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: accent ? '#fff' : 'var(--text-primary)', lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.75)' : subColor }}>{sub}</div>}
    </motion.div>
  );
}

// ──────────────────────────────────────────
// MINI LINE CHART (SVG, no lib needed)
// ──────────────────────────────────────────
function MiniChart({ data, filter, onFilter }) {
  const points = filter === '7' ? data.slice(-7) : data;
  if (!points || points.length === 0) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>No data yet</div>;

  const max = Math.max(...points.map(p => p.total), 1);
  const W = 520, H = 110;
  const step = W / (points.length - 1 || 1);

  const pts = points.map((p, i) => ({
    x: i * step,
    y: H - (p.total / max) * H * 0.85 - 8,
    label: p.label,
    total: p.total
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['7', '30'].map(f => (
          <button key={f} onClick={() => onFilter(f)}
            style={{ padding: '4px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
              background: filter === f ? 'var(--primary)' : 'var(--card-border)', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>
            {f === '7' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 110 }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CF8E6D" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#CF8E6D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#salesGrad)" />
        <path d={pathD} fill="none" stroke="#CF8E6D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#CF8E6D" />
            {i % Math.ceil(pts.length / 7) === 0 && (
              <text x={p.x} y={H} textAnchor="middle" fontSize="9" fill="#8E7E73">{p.label}</text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ──────────────────────────────────────────
// DONUT CHART
// ──────────────────────────────────────────
function DonutChart({ counts }) {
  const data = [
    { label: 'Draft', count: counts.Draft || 0, color: '#9ca3af' },
    { label: 'Confirmed', count: counts.Confirmed || 0, color: '#3b82f6' },
    { label: 'Part. Delivered', count: counts.PartiallyDelivered || 0, color: '#f59e0b' },
    { label: 'Delivered', count: counts.Delivered || 0, color: '#10b981' },
    { label: 'Cancelled', count: counts.Cancelled || 0, color: '#ef4444' },
  ].filter(d => d.count > 0);

  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No orders yet</div>;

  let cumulative = 0;
  const r = 40, cx = 55, cy = 55, strokeW = 16;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <svg width="110" height="110" viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
        {data.map((d, i) => {
          const pct = d.count / total;
          const dashArray = `${pct * circumference} ${circumference}`;
          const offset = circumference * (1 - cumulative);
          cumulative += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={d.color} strokeWidth={strokeW}
              strokeDasharray={dashArray} strokeDashoffset={offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.6s ease' }}
            />
          );
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

// ──────────────────────────────────────────
// STATUS BADGE
// ──────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
      {status}
    </span>
  );
}

// ──────────────────────────────────────────
// SALES DASHBOARD TAB
// ──────────────────────────────────────────
function SalesDashboard({ currentUser, onNavigateToOrders }) {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState('7');

  useEffect(() => {
    apiFetch('/sales/dashboard')
      .then(r => r.json())
      .then(d => { setDash(d); setLoading(false); })
      .catch(() => { setLoading(false); toast.error('Could not load sales analytics'); });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 40, height: 40, border: '3px solid var(--card-border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
    </div>
  );

  if (!dash) return null;
  const { kpis = {}, statusCounts = {}, salesTrend7 = [], salesTrend30 = [], topProducts = [], recentOrders = [] } = dash;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        <KpiCard icon="💰" label="Total Revenue" value={`₹${(kpis.totalRevenue || 0).toLocaleString('en-IN')}`}
          sub="+12.5% vs last month" subColor="#059669" accent />
        <KpiCard icon="📋" label="Total Orders" value={kpis.totalOrders || 0}
          sub={`${kpis.draftOrders || 0} Draft · ${kpis.cancelledOrders || 0} Cancelled`} onClick={onNavigateToOrders} />
        <KpiCard icon="🚚" label="Pending Deliveries" value={kpis.pendingDeliveries || 0}
          sub="Needs Attention" subColor="#d97706" />
        <KpiCard icon="✅" label="Completed" value={kpis.completedOrders || 0}
          sub="Fully Delivered" subColor="#059669" />
        <KpiCard icon="👥" label="Customers" value={kpis.totalCustomers || 0}
          sub="Registered in system" />
      </div>

      {/* CHARTS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <motion.div variants={cardVariants} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22 }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>📈 Sales Revenue Trend</h4>
          <MiniChart data={chartFilter === '7' ? salesTrend7 : salesTrend30} filter={chartFilter} onFilter={setChartFilter} />
        </motion.div>

        <motion.div variants={cardVariants} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22 }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>🍩 Order Status</h4>
          <DonutChart counts={statusCounts} />
        </motion.div>
      </div>

      {/* RECENT ORDERS + TOP PRODUCTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        <motion.div variants={cardVariants} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22, overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>🕐 Recent Sales Orders</h4>
            <button onClick={onNavigateToOrders}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              View All →
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                {['Order ID', 'Customer', 'Product', 'Amount', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No orders yet</td></tr>
              ) : recentOrders.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 12 }}>{o.id}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{o.customer}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product || '—'}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700 }}>₹{(o.total || 0).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '8px 10px' }}><StatusBadge status={o.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div variants={cardVariants} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22 }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>🏆 Top Selling Products</h4>
          {topProducts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 24 }}>No sales data yet</div>
          ) : topProducts.map((p, i) => {
            const maxRev = topProducts[0].revenue || 1;
            const pct = (p.revenue / maxRev) * 100;
            return (
              <motion.div key={p.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{p.qty} units</span>
                </div>
                <div style={{ background: 'var(--card-border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #CF8E6D, #a0614a)', borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>₹{p.revenue.toLocaleString('en-IN')}</div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────
// ORDER FORM
// ──────────────────────────────────────────
function OrderForm({ order, products, currentUser, onSave, onBack }) {
  const isNew = !order;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const isSales = currentUser?.role === 'SALES_USER';
  const canEdit = isAdmin || isSales;

  const [customerName, setCustomerName] = useState(order?.customer || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState(order ? (order.items?.[0]?.address || '') : '');
  const [salesperson, setSalesperson] = useState(order?.salesperson || currentUser?.name || '');
  const [orderDate, setOrderDate] = useState(order?.date || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState(order?.status || 'Draft');
  const [items, setItems] = useState(
    order?.items?.length ? order.items : [{ product: products[0]?.name || '', qty: 1, price: products[0]?.salesPrice || 0, address: '' }]
  );
  const [saving, setSaving] = useState(false);

  const updateItem = (i, field, val) => {
    setItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      if (field === 'product') {
        const p = products.find(p => p.name === val);
        if (p) next[i].price = p.salesPrice || 0;
      }
      return next;
    });
  };

  const addItem = () => setItems(prev => [...prev, { product: products[0]?.name || '', qty: 1, price: products[0]?.salesPrice || 0, address: '' }]);
  const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const total = items.reduce((s, it) => s + ((it.qty || 0) * (it.price || 0)), 0);

  const isLocked = status === 'Delivered' || status === 'Fully Delivered' || status === 'Cancelled';
  const isConfirmed = status === 'Confirmed' || status === 'Partially Delivered';

  const getStockStatus = (productName, qty) => {
    const p = products.find(p => p.name === productName);
    if (!p) return null;
    const free = (p.onHandQty || p.freeToUseQty || 0);
    if (free >= qty) return { ok: true, free, msg: `Free Stock: ${free}` };
    return { ok: false, free, msg: `⚠️ Only ${free} available (shortage: ${qty - free})` };
  };

  const handleSave = async (e, newStatus) => {
    e.preventDefault();
    if (!customerName.trim()) { toast.error('Customer name is required'); return; }
    if (items.length === 0) { toast.error('Add at least one product'); return; }
    setSaving(true);

    const saveStatus = newStatus || status;
    const itemsWithAddress = items.map(it => ({ ...it, address: customerAddress }));
    const body = {
      date: orderDate, customer: customerName, status: saveStatus,
      salesperson, items: itemsWithAddress, total,
      owner: order?.owner || currentUser?.loginId || currentUser?.login_id || ''
    };

    try {
      let res;
      if (isNew) {
        res = await apiFetch('/sales-orders', { method: 'POST', body: JSON.stringify(body) });
      } else {
        res = await apiFetch(`/sales-orders/${order.id}`, { method: 'PUT', body: JSON.stringify(body) });
      }
      const data = await res.json();
      if (data.success !== false) {
        // Save customer info
        if (customerPhone || customerEmail) {
          await apiFetch('/customers', { method: 'POST', body: JSON.stringify({ name: customerName, phone: customerPhone, email: customerEmail, address: customerAddress }) });
        }
        toast.success(isNew ? 'Order created successfully!' : 'Order saved!', { icon: '✅' });
        onSave();
      } else {
        toast.error(data.message || 'Failed to save order');
      }
    } catch {
      toast.error('Server unreachable');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_WORKFLOW = {
    Draft: ['Confirm Order', 'Cancel Order'],
    Confirmed: ['Update Delivery', 'Cancel Order'],
    'Partially Delivered': ['Update Delivery', 'Cancel Order'],
    Delivered: [], 'Fully Delivered': [], Cancelled: []
  };

  const nextStatusMap = { 'Confirm Order': 'Confirmed', 'Update Delivery': 'Delivered', 'Cancel Order': 'Cancelled' };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--card-border)', paddingBottom: 18 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
            {isNew ? 'New Sales Order' : `Edit ${order.id}`}
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
            {isNew ? 'Fill in the order details below' : `Editing order · last saved ${order.date}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <StatusBadge status={status} />
          <button onClick={onBack} style={{ background: 'var(--card-border)', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>← Back</button>
        </div>
      </div>

      <form onSubmit={e => handleSave(e)} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* Customer Info */}
        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>👤 Customer Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Customer Name *</label>
              <input className="filter-control-input" value={customerName} onChange={e => setCustomerName(e.target.value)}
                disabled={!canEdit || isLocked} required style={{ fontSize: 15 }} placeholder="e.g. ABC Furniture" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Phone</label>
              <input className="filter-control-input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                disabled={!canEdit || isLocked} placeholder="+91 98765 43210" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Email</label>
              <input className="filter-control-input" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                disabled={!canEdit || isLocked} type="email" placeholder="customer@email.com" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Delivery Address</label>
              <input className="filter-control-input" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)}
                disabled={!canEdit || isLocked} placeholder="Colaba, Mumbai, 400001" />
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div>
          <h4 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>📋 Order Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Salesperson</label>
              <input className="filter-control-input" value={salesperson} onChange={e => setSalesperson(e.target.value)}
                disabled={!canEdit || isConfirmed || isLocked} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Order Date</label>
              <input className="filter-control-input" type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)}
                disabled={!canEdit || isConfirmed || isLocked} />
            </div>
          </div>
        </div>

        {/* Products */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>📦 Products</h4>
            {canEdit && !isLocked && !isConfirmed && (
              <button type="button" onClick={addItem}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                + Add Product
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item, i) => {
              const stock = getStockStatus(item.product, item.qty || 0);
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'start',
                    background: '#fafafa', border: '1px solid var(--card-border)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Product</label>
                    <select className="filter-control-select" value={item.product}
                      onChange={e => updateItem(i, 'product', e.target.value)}
                      disabled={!canEdit || isLocked || isConfirmed}>
                      {products.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    {stock && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: stock.ok ? '#059669' : '#d97706' }}>{stock.msg}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Qty</label>
                    <input type="number" className="filter-control-input" value={item.qty}
                      onChange={e => updateItem(i, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={!canEdit || isLocked || isConfirmed} min={1} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Unit Price (₹)</label>
                    <input type="number" className="filter-control-input" value={item.price}
                      onChange={e => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                      disabled={!canEdit || isLocked} min={0} />
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Sub: ₹{((item.qty || 0) * (item.price || 0)).toLocaleString('en-IN')}</span>
                  </div>
                  {canEdit && !isLocked && !isConfirmed && items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#dc2626', fontWeight: 700, marginTop: 18, fontSize: 14 }}>
                      ✕
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <div style={{ background: 'linear-gradient(135deg, #CF8E6D 0%, #a0614a 100%)', color: '#fff', borderRadius: 10, padding: '12px 24px', textAlign: 'right' }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>TOTAL AMOUNT</div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>₹{total.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!isLocked && (
              <button type="submit" disabled={saving}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                {saving ? 'Saving...' : isNew ? 'Create Order' : 'Save Draft'}
              </button>
            )}

            {STATUS_WORKFLOW[status]?.map(action => {
              const nextStatus = nextStatusMap[action];
              const btnStyle = {
                'Confirm Order': { bg: '#2563eb', color: '#fff' },
                'Update Delivery': { bg: '#059669', color: '#fff' },
                'Cancel Order': { bg: '#fee2e2', color: '#dc2626' }
              }[action] || {};
              return (
                <button key={action} type="button" disabled={saving}
                  onClick={async (e) => {
                    if (action === 'Cancel Order' && !window.confirm('Cancel this order?')) return;
                    await handleSave(e, nextStatus);
                  }}
                  style={{ background: btnStyle.bg, color: btnStyle.color, border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  {action}
                </button>
              );
            })}
          </div>
        )}
      </form>
    </motion.div>
  );
}

// ──────────────────────────────────────────
// ORDERS TAB (List + Kanban)
// ──────────────────────────────────────────
function OrdersTab({ currentUser, products }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'kanban' | 'form'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const isSales = currentUser?.role === 'SALES_USER';
  const canEdit = isAdmin || isSales;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { mockDashboardData } = await import('../data/mockData');
      setOrders(mockDashboardData.salesOrders);
    } catch { toast.error('Failed to load mock orders'); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleEdit = (order) => { setSelectedOrder(order); setView('form'); };
  const handleNew = () => { setSelectedOrder(null); setView('form'); };
  const handleSaved = () => { setView('list'); fetchOrders(); };

  if (view === 'form') return (
    <OrderForm order={selectedOrder} products={products} currentUser={currentUser}
      onSave={handleSaved} onBack={() => setView('list')} />
  );

  const statuses = ['All', 'Draft', 'Confirmed', 'Partially Delivered', 'Delivered', 'Cancelled'];
  const filtered = orders.filter(o => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase()) || (o.customer || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['list', 'kanban'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: view === v ? 'var(--primary)' : 'var(--card-border)', color: view === v ? '#fff' : 'var(--text-primary)' }}>
              {v === 'list' ? '☰ List' : '⬛ Kanban'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input className="filter-control-input" placeholder="Search orders, customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 230 }} />
          <select className="filter-control-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 160 }}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          {canEdit && (
            <button onClick={handleNew}
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>
              + New Order
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 50, color: 'var(--text-secondary)' }}>Loading orders...</div>
      ) : view === 'list' ? (
        <div className="sf-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sf-table-wrapper">
            <table className="sf-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>
                  {['Order ID', 'Date', 'Customer', 'Salesperson', 'Items', 'Total', 'Status', 'Action'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No orders found</td></tr>
                ) : filtered.map((o, i) => (
                  <motion.tr key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="sf-table-row-hover">
                    <td className="order-id-cell" style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>{o.id}</td>
                    <td>{o.date}</td>
                    <td style={{ fontWeight: 600 }}>{o.customer}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{o.salesperson}</td>
                    <td>{o.items?.length || 0} item(s)</td>
                    <td style={{ fontWeight: 700 }}>₹{(o.total || 0).toLocaleString('en-IN')}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>
                      <button className="sf-btn" onClick={() => handleEdit(o)}>Manage</button>
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
        /* KANBAN */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, alignItems: 'start' }}>
          {['Draft', 'Confirmed', 'Partially Delivered', 'Delivered', 'Cancelled'].map(col => {
            const colOrders = filtered.filter(o => o.status === col);
            const colors = STATUS_COLORS[col];
            return (
              <div key={col} className="sf-panel" style={{ padding: 14, minHeight: 300 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.color, background: colors.bg, border: `1px solid ${colors.border}`, padding: '3px 10px', borderRadius: 20 }}>
                    {col}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{colOrders.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colOrders.map(o => (
                    <motion.div key={o.id} whileHover={{ scale: 1.02, y: -2 }} onClick={() => handleEdit(o)}
                      style={{ background: 'var(--bg-dark)', border: '1px solid var(--card-border)', borderRadius: 10, padding: 12, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 12 }}>{o.id}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{o.date}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{o.customer}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{o.items?.length || 0} item(s)</div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>₹{(o.total || 0).toLocaleString('en-IN')}</div>
                    </motion.div>
                  ))}
                  {colOrders.length === 0 && <div style={{ padding: 20, border: '1px dashed var(--card-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center' }}>Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ──────────────────────────────────────────
// CUSTOMERS TAB
// ──────────────────────────────────────────
function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/customers').then(r => r.ok ? r.json() : []).then(d => { setCustomers(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <input className="filter-control-input" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} customers</span>
      </div>
      <div className="sf-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="sf-table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              {['Customer ID', 'Name', 'Phone', 'Email', 'Address', 'Total Orders', 'Total Revenue', 'Last Order'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No customers found</td></tr>
            ) : filtered.map((c, i) => (
              <motion.tr key={c.customer_id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="sf-table-row-hover">
                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 12 }}>{c.customer_id}</td>
                <td style={{ fontWeight: 700 }}>{c.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                <td style={{ fontWeight: 700, textAlign: 'center' }}>{c.totalOrders}</td>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{(c.totalRevenue || 0).toLocaleString('en-IN')}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.lastOrder || '—'}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────
// MAIN SALES MODULE COMPONENT
// ──────────────────────────────────────────
function SalesOrders({ onNavigate, currentUser }) {
  const role = currentUser?.role || 'PENDING';
  const isAdmin = role === 'ADMIN' || role === 'System Administrator';
  const isSales = role === 'SALES_USER';
  const isOwner = role === 'BUSINESS_OWNER';
  const hasAccess = isAdmin || isSales || isOwner;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);

  // Load products for the order form
  useEffect(() => {
    if (!hasAccess) return;
    apiFetch('/products').then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {});
  }, [hasAccess]);

  // ACCESS DENIED
  if (!hasAccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 60, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 32 }}>🔒</div>
        <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>Sales Module — Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, fontSize: 14, lineHeight: 1.6 }}>
          Your current role (<strong>{role}</strong>) does not have access to the Sales module.
          Please contact your System Administrator to be assigned the <strong>Sales User</strong> role.
        </p>
        <button onClick={() => onNavigate('dashboard')}
          style={{ marginTop: 24, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'orders', label: '📋 Sales Orders' },
    { id: 'customers', label: '👥 Customers' }
  ];

  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>Sales Module</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
            Manage sales orders, track deliveries, and monitor revenue
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ padding: '4px 12px', background: '#d1fae5', color: '#059669', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid #6ee7b7' }}>
            🟢 ERP Connected
          </span>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--card-border)', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', fontSize: 14, fontWeight: 700,
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.2s'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === 'dashboard' && <SalesDashboard currentUser={currentUser} onNavigateToOrders={() => setActiveTab('orders')} />}
          {activeTab === 'orders' && <OrdersTab currentUser={currentUser} products={products} />}
          {activeTab === 'customers' && <CustomersTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default SalesOrders;
