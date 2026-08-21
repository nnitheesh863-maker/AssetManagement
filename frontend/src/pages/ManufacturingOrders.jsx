import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API = 'http://127.0.0.1:5000/api';

const STATUS_COLORS = {
  Draft:                 { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
  Confirmed:             { bg: '#dbeafe', color: '#1d4ed8', border: '#93c5fd' },
  'Material Checking':   { bg: '#ede9fe', color: '#7c3aed', border: '#c4b5fd' },
  'Ready For Production':{ bg: '#fef3c7', color: '#b45309', border: '#fcd34d' },
  'In Progress':         { bg: '#fed7aa', color: '#c2410c', border: '#fdba74' },
  'Quality Check':       { bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4' },
  Completed:             { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  Done:                  { bg: '#d1fae5', color: '#059669', border: '#6ee7b7' },
  Cancelled:             { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
};

const OP_STATUS_COLORS = {
  Pending:   { bg: '#f3f4f6', color: '#6b7280' },
  Running:   { bg: '#fed7aa', color: '#c2410c' },
  Completed: { bg: '#d1fae5', color: '#059669' },
  Failed:    { bg: '#fee2e2', color: '#dc2626' },
};

const STATUS_FLOW = [
  'Draft', 'Confirmed', 'Material Checking', 'Ready For Production',
  'In Progress', 'Quality Check', 'Completed'
];

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
// SHARED UI
// ─────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, subColor = '#6b7280', accent, danger, onClick }) {
  const bg = accent
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    : danger
      ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
      : 'var(--card-bg)';
  return (
    <motion.div variants={cardV} whileHover={{ scale: 1.025, y: -3 }} onClick={onClick}
      style={{ background: bg, border: (!accent && !danger) ? '1px solid var(--card-border)' : 'none',
        borderRadius: 16, padding: '20px 22px', cursor: onClick ? 'pointer' : 'default',
        boxShadow: (accent || danger) ? '0 8px 24px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: (accent || danger) ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: (accent || danger) ? '#fff' : 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, fontWeight: 600, color: (accent || danger) ? 'rgba(255,255,255,0.8)' : subColor }}>{sub}</div>}
    </motion.div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{status}</span>;
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 36, height: 36, border: '3px solid var(--card-border)', borderTopColor: '#f59e0b', borderRadius: '50%' }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// MINI CHART (SVG)
// ─────────────────────────────────────────────
function MiniChart({ data, filter, onFilter }) {
  const points = filter === '7' ? data.slice(-7) : data;
  if (!points?.length) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No production data yet</div>;
  const max = Math.max(...points.map(p => p.qty), 1);
  const W = 520, H = 100;
  const step = W / (points.length - 1 || 1);
  const pts = points.map((p, i) => ({ x: i * step, y: H - (p.qty / max) * H * 0.85 - 8, label: p.label, qty: p.qty }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['7', '30'].map(f => (
          <button key={f} onClick={() => onFilter(f)} style={{ padding: '4px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: filter === f ? '#f59e0b' : 'var(--card-border)', color: filter === f ? '#fff' : 'var(--text-secondary)' }}>
            {f === '7' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 100 }}>
        <defs>
          <linearGradient id="mfgGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#mfgGrad)" />
        <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#f59e0b" />
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
    { label: 'In Progress', count: counts['In Progress'] || 0, color: '#f59e0b' },
    { label: 'Quality Check', count: counts['Quality Check'] || 0, color: '#ec4899' },
    { label: 'Completed', count: counts.Completed || 0, color: '#10b981' },
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}>
        {data.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{d.label}</span>
            <span style={{ fontWeight: 700 }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MANUFACTURING DASHBOARD
// ─────────────────────────────────────────────
function ManufacturingDashboard({ onNavigateToOrders }) {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState('7');

  useEffect(() => {
    apiFetch('/manufacturing/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setDash(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!dash) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Could not load dashboard.</div>;

  const { kpis = {}, statusCounts = {}, productionTrend7 = [], productionTrend30 = [], recentOrders = [], materialAlerts = [], topProducts = [] } = dash;

  return (
    <motion.div variants={containerV} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 14 }}>
        <KpiCard icon="⚙️" label="Active Orders" value={kpis.activeOrders || 0} accent sub="Currently in production" />
        <KpiCard icon="✅" label="Units Produced" value={kpis.completedUnits || 0} sub="This month" subColor="#059669" onClick={onNavigateToOrders} />
        <KpiCard icon="📋" label="Work Orders" value={kpis.pendingWorkOrders || 0} sub="Pending operations" subColor="#d97706" />
        <KpiCard icon="📈" label="Efficiency" value={`${kpis.efficiency || 0}%`}
          sub={kpis.efficiency >= 80 ? '🟢 Good' : kpis.efficiency >= 60 ? '🟡 Fair' : '🔴 Low'}
          subColor={kpis.efficiency >= 80 ? '#059669' : kpis.efficiency >= 60 ? '#d97706' : '#dc2626'} />
        <KpiCard icon="🧱" label="Material Consumed" value={kpis.totalConsumed || 0} sub="Units used in production" />
        {kpis.delayedOrders > 0 && <KpiCard icon="⏰" label="Delayed Orders" value={kpis.delayedOrders} danger sub="Past expected date" />}
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📈 Production Output Trend</h4>
          <MiniChart data={chartFilter === '7' ? productionTrend7 : productionTrend30} filter={chartFilter} onFilter={setChartFilter} />
        </motion.div>
        <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22 }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>🍩 Order Status</h4>
          <DonutChart counts={statusCounts} />
        </motion.div>
      </div>

      {/* RECENT ORDERS + MATERIAL ALERTS + TOP PRODUCTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 22, overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>🕐 Recent Manufacturing Orders</h4>
            <button onClick={onNavigateToOrders} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>View All →</button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--card-border)' }}>
              {['MO #', 'Product', 'Qty', 'Assignee', 'Status'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>No orders yet</td></tr>
              ) : recentOrders.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: 12 }}>{o.id}</td>
                  <td style={{ padding: '8px', fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 700 }}>{o.qty}</td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{o.assignee}</td>
                  <td style={{ padding: '8px' }}><StatusBadge status={o.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Material Alerts */}
          {materialAlerts.length > 0 && (
            <motion.div variants={cardV} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 16, padding: 18 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#dc2626' }}>⚠️ Material Shortages</h4>
              {materialAlerts.slice(0, 4).map((a, i) => (
                <div key={i} style={{ fontSize: 12, marginBottom: 8, padding: '6px 0', borderBottom: '1px solid #fecaca' }}>
                  <div style={{ fontWeight: 700 }}>{a.material}</div>
                  <div style={{ color: '#dc2626' }}>Need: {a.required} · Have: {a.available} · Short: <strong>{a.shortage}</strong></div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Top Products */}
          <motion.div variants={cardV} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 20, flex: 1 }}>
            <h4 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>🏆 Top Produced Items</h4>
            {topProducts.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: 16 }}>No data yet</div>
            ) : topProducts.map((p, i) => {
              const maxQty = topProducts[0].qty || 1;
              const pct = (p.qty / maxQty) * 100;
              return (
                <div key={p.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{p.qty} units</span>
                  </div>
                  <div style={{ background: 'var(--card-border)', borderRadius: 4, height: 5 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// WORK ORDERS PANEL (inside order form)
// ─────────────────────────────────────────────
function WorkOrdersPanel({ operations, onUpdate, canEdit, isLocked }) {
  const updateOp = (i, field, val) => {
    const next = [...operations];
    next[i] = { ...next[i], [field]: val };
    onUpdate(next);
  };
  const addOp = () => onUpdate([...operations, { operation: 'New Operation', workCenter: 'Assembly Line', duration: 60, realDuration: 0, status: 'Pending' }]);
  const removeOp = (i) => onUpdate(operations.filter((_, idx) => idx !== i));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>⚙️ Work Orders / Operations</h4>
        {canEdit && !isLocked && <button type="button" onClick={addOp} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>+ Add Operation</button>}
      </div>
      {operations.length === 0 ? (
        <div style={{ padding: 20, border: '1px dashed var(--card-border)', borderRadius: 10, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>No work orders yet</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {operations.map((op, i) => {
            const opCol = OP_STATUS_COLORS[op.status] || OP_STATUS_COLORS.Pending;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end',
                  background: '#fafafa', border: '1px solid var(--card-border)', borderRadius: 10, padding: '12px 14px' }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Operation</label>
                  <input className="filter-control-input" value={op.operation || ''} onChange={e => updateOp(i, 'operation', e.target.value)}
                    disabled={!canEdit || isLocked} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Work Center</label>
                  <select className="filter-control-select" value={op.workCenter || ''} onChange={e => updateOp(i, 'workCenter', e.target.value)}
                    disabled={!canEdit || isLocked} style={{ width: '100%' }}>
                    {['Pre-Production', 'Assembly Line', 'Finishing Line', 'Upholstery Dept', 'Quality Control', 'Packaging'].map(wc => <option key={wc}>{wc}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Planned (min)</label>
                  <input type="number" className="filter-control-input" value={op.duration || 0} onChange={e => updateOp(i, 'duration', parseInt(e.target.value) || 0)}
                    disabled={!canEdit || isLocked} min={0} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Actual (min)</label>
                  <input type="number" className="filter-control-input" value={op.realDuration || 0} onChange={e => updateOp(i, 'realDuration', parseInt(e.target.value) || 0)}
                    disabled={!canEdit} min={0} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Status</label>
                  <select className="filter-control-select" value={op.status || 'Pending'} onChange={e => updateOp(i, 'status', e.target.value)}
                    disabled={!canEdit} style={{ width: '100%', background: opCol.bg, color: opCol.color }}>
                    {['Pending', 'Running', 'Completed', 'Failed'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {canEdit && !isLocked && (
                  <button type="button" onClick={() => removeOp(i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: 14 }}>✕</button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MATERIAL AVAILABILITY
// ─────────────────────────────────────────────
function MaterialCheck({ components }) {
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    if (!components.length) return;
    setLoading(true);
    try {
      const res = await apiFetch('/manufacturing/check-materials', { method: 'POST', body: JSON.stringify({ components }) });
      const data = await res.json();
      setCheck(data);
    } catch { toast.error('Material check failed'); }
    setLoading(false);
  };

  return (
    <div style={{ background: '#f8fafc', border: '1px solid var(--card-border)', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: check ? 12 : 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>🔍 Material Availability Check</span>
        <button type="button" onClick={runCheck} disabled={loading}
          style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          {loading ? 'Checking...' : 'Check Stock'}
        </button>
      </div>
      {check && (
        <div style={{ marginTop: 10 }}>
          {check.available ? (
            <div style={{ padding: '8px 14px', background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 8, color: '#059669', fontWeight: 700, fontSize: 13 }}>
              ✅ All materials available — Production can start!
            </div>
          ) : (
            <div>
              <div style={{ padding: '8px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                ⚠️ Material shortages detected:
              </div>
              {check.shortages.map(s => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, marginBottom: 4, fontSize: 12 }}>
                  <span style={{ fontWeight: 700 }}>{s.name}</span>
                  <span>Need: <strong>{s.required}</strong> · Have: <strong style={{ color: s.available === 0 ? '#dc2626' : '#d97706' }}>{s.available}</strong> · Short: <strong style={{ color: '#dc2626' }}>{s.shortage}</strong></span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STATUS TIMELINE
// ─────────────────────────────────────────────
function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUS_FLOW.indexOf(currentStatus);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
      {STATUS_FLOW.map((s, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx;
        const isCancelled = currentStatus === 'Cancelled';
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${isDone || isActive ? '#f59e0b' : 'var(--card-border)'}`,
                background: isDone ? '#f59e0b' : isActive ? '#fff7ed' : 'var(--card-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                opacity: isCancelled && !isActive ? 0.4 : 1 }}>
                {isDone ? '✓' : isActive ? '●' : '○'}
              </div>
              <div style={{ fontSize: 9, color: isDone || isActive ? '#d97706' : 'var(--text-secondary)', marginTop: 4, textAlign: 'center', maxWidth: 60, lineHeight: 1.2, fontWeight: isActive ? 800 : 500 }}>{s}</div>
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <div style={{ height: 2, width: 20, background: i < currentIdx ? '#f59e0b' : 'var(--card-border)', flexShrink: 0, marginBottom: 20, transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// MANUFACTURING ORDER FORM
// ─────────────────────────────────────────────
function MoForm({ order, boms, products, currentUser, onSave, onBack }) {
  const isNew = !order;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const canEdit = isAdmin || currentUser?.role === 'MANUFACTURING_USER';
  const isLocked = ['Completed', 'Done', 'Cancelled'].includes(order?.status);
  const isInProgress = ['In Progress', 'Quality Check'].includes(order?.status);

  const [product, setProduct] = useState(order?.product || '');
  const [selectedBom, setSelectedBom] = useState(order?.bom || '');
  const [qty, setQty] = useState(order?.qty || 1);
  const [unit, setUnit] = useState(order?.units || 'Units');
  const [assignee, setAssignee] = useState(order?.assignee || currentUser?.name || '');
  const [orderDate, setOrderDate] = useState(order?.date || new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState(order?.expected_completion || '');
  const [notes, setNotes] = useState(order?.notes || '');
  const [status, setStatus] = useState(order?.status || 'Draft');
  const [components, setComponents] = useState(order?.components || []);
  const [operations, setOperations] = useState(order?.operations || order?.workOrders || []);
  const [qualityStatus, setQualityStatus] = useState(order?.quality_status || '');
  const [qualityNotes, setQualityNotes] = useState(order?.quality_notes || '');
  const [activeDetailTab, setActiveDetailTab] = useState('components');
  const [saving, setSaving] = useState(false);

  // Load BOM when product/BOM changes
  const loadBom = (bomId) => {
    const bom = boms.find(b => b.id === bomId);
    if (!bom) return;
    setSelectedBom(bomId);
    const scaledComponents = (bom.components || bom.work_orders?.filter(w => w.name) || []).map(c => ({
      name: c.name, qty: Math.ceil((c.qty || 1) * qty), consumed: 0, unit: c.unit || 'Units'
    }));
    setComponents(scaledComponents.length ? scaledComponents : components);
    const ops = (bom.workOrders || bom.work_orders || []).map(w => ({
      operation: w.operation, workCenter: w.workCenter, duration: w.duration || 60, realDuration: 0, status: 'Pending'
    }));
    setOperations(ops.length ? ops : operations);
    toast.success('BOM loaded! Components and operations pre-filled.', { icon: '📋' });
  };

  const updateComponent = (i, field, val) => {
    const next = [...components];
    next[i] = { ...next[i], [field]: val };
    setComponents(next);
  };
  const addComponent = () => setComponents(p => [...p, { name: '', qty: 1, consumed: 0, unit: 'Units' }]);
  const removeComponent = (i) => setComponents(p => p.filter((_, idx) => idx !== i));

  const getNextStatus = () => {
    const idx = STATUS_FLOW.indexOf(status);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const handleSave = async (e, newStatus) => {
    e && e.preventDefault();
    if (!product.trim()) { toast.error('Product name required'); return; }
    setSaving(true);
    const saveStatus = newStatus || status;
    const body = {
      date: orderDate, product, bom: selectedBom, qty, units: unit,
      assignee, status: saveStatus, components, operations,
      expected_completion: expectedDate, notes,
      qualityStatus: qualityStatus || undefined,
      qualityNotes: qualityNotes || undefined,
      owner: order?.owner || currentUser?.login_id || ''
    };
    try {
      let res;
      if (isNew) res = await apiFetch('/manufacturing-orders', { method: 'POST', body: JSON.stringify(body) });
      else res = await apiFetch(`/manufacturing-orders/${order.id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success !== false) {
        toast.success(isNew ? 'Manufacturing order created!' : 'Order saved!', { icon: '✅' });
        onSave();
      } else toast.error(data.message || 'Failed');
    } catch { toast.error('Server unreachable'); }
    finally { setSaving(false); }
  };

  const nextStatus = getNextStatus();

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--card-border)', paddingBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{isNew ? 'New Manufacturing Order' : `MO: ${order.id}`}</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>Production order management</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <StatusBadge status={status} />
            <button onClick={onBack} style={{ background: 'var(--card-border)', border: 'none', borderRadius: 8, padding: '7px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>← Back</button>
          </div>
        </div>
        {!isNew && <StatusTimeline currentStatus={status} />}
      </div>

      <form onSubmit={e => handleSave(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* PRODUCTION INFO */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '22px 28px' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>📦 Production Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Finished Product *</label>
              {products.length > 0 ? (
                <select className="filter-control-select" value={product}
                  onChange={e => {
                    setProduct(e.target.value);
                    const bom = boms.find(b => b.product === e.target.value);
                    if (bom) loadBom(bom.id);
                  }}
                  disabled={!canEdit || isLocked || isInProgress} style={{ width: '100%', fontSize: 15 }}>
                  <option value="">— Select Product —</option>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              ) : (
                <input className="filter-control-input" value={product} onChange={e => setProduct(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%', fontSize: 15 }} placeholder="Product name" />
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Bill of Materials (BOM)</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="filter-control-select" value={selectedBom} onChange={e => loadBom(e.target.value)}
                  disabled={!canEdit || isLocked || isInProgress} style={{ flex: 1 }}>
                  <option value="">— No BOM —</option>
                  {boms.map(b => <option key={b.id} value={b.id}>{b.id} — {b.product}</option>)}
                </select>
                {selectedBom && <button type="button" onClick={() => loadBom(selectedBom)} style={{ background: '#fef3c7', border: '1px solid #fcd34d', color: '#b45309', borderRadius: 8, padding: '0 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Load</button>}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Quantity</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" className="filter-control-input" value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={!canEdit || isLocked || isInProgress} min={1} style={{ flex: 1 }} />
                <select className="filter-control-select" value={unit} onChange={e => setUnit(e.target.value)}
                  disabled={!canEdit || isLocked} style={{ width: 100 }}>
                  {['Units', 'Pcs', 'Sets', 'Kg', 'Meters'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Assigned Employee</label>
              <input className="filter-control-input" value={assignee} onChange={e => setAssignee(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Planned Date</label>
              <input type="date" className="filter-control-input" value={orderDate} onChange={e => setOrderDate(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Expected Completion</label>
              <input type="date" className="filter-control-input" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Notes / Special Instructions</label>
              <input className="filter-control-input" value={notes} onChange={e => setNotes(e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} placeholder="Any notes about this production order..." />
            </div>
          </div>
        </div>

        {/* COMPONENTS & WORK ORDERS TABS */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '2px solid var(--card-border)', padding: '0 24px' }}>
            {[['components', '🧱 Raw Materials'], ['operations', '⚙️ Work Orders']].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setActiveDetailTab(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', fontSize: 14, fontWeight: 700,
                  color: activeDetailTab === id ? '#f59e0b' : 'var(--text-secondary)',
                  borderBottom: activeDetailTab === id ? '2px solid #f59e0b' : '2px solid transparent', marginBottom: -2 }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ padding: 24 }}>
            {activeDetailTab === 'components' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>🧱 Bill of Materials — Components</h4>
                  {canEdit && !isLocked && (
                    <button type="button" onClick={addComponent} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>+ Add Material</button>
                  )}
                </div>
                {components.length === 0 ? (
                  <div style={{ padding: 20, border: '1px dashed var(--card-border)', borderRadius: 10, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    No materials. Select a BOM above to auto-populate, or add manually.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {components.map((comp, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end',
                          background: '#fafafa', border: '1px solid var(--card-border)', borderRadius: 10, padding: '12px 14px' }}>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Material Name</label>
                          {products.length > 0 ? (
                            <select className="filter-control-select" value={comp.name} onChange={e => updateComponent(i, 'name', e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }}>
                              <option value="">— Select —</option>
                              {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                            </select>
                          ) : (
                            <input className="filter-control-input" value={comp.name} onChange={e => updateComponent(i, 'name', e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }} />
                          )}
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Required Qty</label>
                          <input type="number" className="filter-control-input" value={comp.qty} onChange={e => updateComponent(i, 'qty', parseFloat(e.target.value) || 0)} disabled={!canEdit || isLocked} min={0} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Consumed</label>
                          <input type="number" className="filter-control-input" value={comp.consumed || 0} onChange={e => updateComponent(i, 'consumed', parseFloat(e.target.value) || 0)} disabled={!canEdit} min={0} style={{ width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Unit</label>
                          <select className="filter-control-select" value={comp.unit || 'Units'} onChange={e => updateComponent(i, 'unit', e.target.value)} disabled={!canEdit || isLocked} style={{ width: '100%' }}>
                            {['Units', 'Kg', 'Meters', 'Pcs', 'Liters', 'Sq. Ft'].map(u => <option key={u}>{u}</option>)}
                          </select>
                        </div>
                        {canEdit && !isLocked && (
                          <button type="button" onClick={() => removeComponent(i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: '#dc2626', fontWeight: 700, fontSize: 14 }}>✕</button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
                {/* Material check */}
                {components.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <MaterialCheck components={components} />
                  </div>
                )}
              </div>
            ) : (
              <WorkOrdersPanel operations={operations} onUpdate={setOperations} canEdit={canEdit} isLocked={isLocked} />
            )}
          </div>
        </div>

        {/* QUALITY CHECK (visible when in Quality Check status) */}
        {(status === 'Quality Check' || qualityStatus) && (
          <div style={{ background: '#fdf2f8', border: '1px solid #f9a8d4', borderRadius: 16, padding: '22px 28px' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#9d174d', textTransform: 'uppercase' }}>🔬 Quality Inspection</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#9d174d', display: 'block', marginBottom: 5 }}>Quality Status</label>
                <select className="filter-control-select" value={qualityStatus} onChange={e => setQualityStatus(e.target.value)} disabled={!canEdit}>
                  <option value="">— Select —</option>
                  {['Passed', 'Failed', 'Rework Required'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#9d174d', display: 'block', marginBottom: 5 }}>Inspector Remarks</label>
                <input className="filter-control-input" value={qualityNotes} onChange={e => setQualityNotes(e.target.value)} disabled={!canEdit} placeholder="Notes from quality inspection..." style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        {canEdit && (
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 14, padding: '18px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {!isLocked && (
              <button type="submit" disabled={saving} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                {saving ? 'Saving...' : isNew ? '🔨 Create MO' : '💾 Save Changes'}
              </button>
            )}
            {nextStatus && !isNew && !isLocked && (
              <button type="button" disabled={saving} onClick={async () => {
                if (nextStatus === 'In Progress' && !window.confirm('Start production? This will reserve raw materials from inventory.')) return;
                if (nextStatus === 'Completed' && !window.confirm('Mark as Completed? This will consume raw materials and produce finished goods in inventory.')) return;
                await handleSave(null, nextStatus);
              }}
                style={{ background: nextStatus === 'Completed' ? '#059669' : nextStatus === 'In Progress' ? '#f59e0b' : '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                → Advance to: {nextStatus}
              </button>
            )}
            {!isLocked && !isNew && (
              <button type="button" disabled={saving} onClick={async () => {
                if (!window.confirm('Cancel this manufacturing order?')) return;
                await handleSave(null, 'Cancelled');
              }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                Cancel MO
              </button>
            )}
          </div>
        )}
      </form>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// MANUFACTURING ORDERS TAB
// ─────────────────────────────────────────────
function ManufacturingOrdersTab({ currentUser, boms, products }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const canEdit = isAdmin || currentUser?.role === 'MANUFACTURING_USER';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { mockDashboardData } = await import('../data/mockData');
      setOrders(mockDashboardData.manufacturingOrders);
    } catch { toast.error('Failed to load mock orders'); }
    setLoading(false);
  }, []);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  if (view === 'form') return <MoForm order={selected} boms={boms} products={products} currentUser={currentUser} onSave={() => { setView('list'); fetchOrders(); }} onBack={() => setView('list')} />;

  const statuses = ['All', 'Draft', 'Confirmed', 'Material Checking', 'Ready For Production', 'In Progress', 'Quality Check', 'Completed', 'Cancelled'];
  const filtered = orders.filter(o => {
    const ms = !search || o.id?.toLowerCase().includes(search.toLowerCase()) || (o.product || '').toLowerCase().includes(search.toLowerCase());
    const mst = statusFilter === 'All' || o.status === statusFilter;
    return ms && mst;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['list', 'kanban'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: view === v ? '#f59e0b' : 'var(--card-border)', color: view === v ? '#fff' : 'var(--text-primary)' }}>
              {v === 'list' ? '☰ List' : '⬛ Kanban'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="filter-control-input" placeholder="Search MO, product..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
          <select className="filter-control-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width: 180 }}>
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
          {canEdit && (
            <button onClick={() => { setSelected(null); setView('form'); }} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>
              + New MO
            </button>
          )}
        </div>
      </div>

      {loading ? <Spinner /> : view === 'list' ? (
        <div className="sf-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="sf-table-wrapper">
            <table className="sf-table" style={{ fontSize: 13 }}>
              <thead>
                <tr>{['MO #', 'Date', 'Product', 'Qty', 'BOM', 'Assignee', 'Expected', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No manufacturing orders found</td></tr>
                ) : filtered.map((o, i) => (
                  <motion.tr key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="sf-table-row-hover">
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: 12 }}>{o.id}</td>
                    <td>{o.date}</td>
                    <td style={{ fontWeight: 600 }}>{o.product}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{o.qty} {o.units}</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 11 }}>{o.bom || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{o.assignee}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{o.expected_completion || '—'}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td><button className="sf-btn" onClick={() => { setSelected(o); setView('form'); }}>Manage</button></td>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14, alignItems: 'start' }}>
          {['Draft', 'Confirmed', 'In Progress', 'Quality Check', 'Completed', 'Cancelled'].map(col => {
            const colOrders = filtered.filter(o => o.status === col || (col === 'Completed' && o.status === 'Done'));
            const colors = STATUS_COLORS[col] || { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
            return (
              <div key={col} className="sf-panel" style={{ padding: 14, minHeight: 250 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: colors.color, background: colors.bg, border: `1px solid ${colors.border}`, padding: '3px 10px', borderRadius: 20 }}>{col}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{colOrders.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colOrders.map(o => (
                    <motion.div key={o.id} whileHover={{ scale: 1.02, y: -2 }} onClick={() => { setSelected(o); setView('form'); }}
                      style={{ background: 'var(--bg-dark)', border: '1px solid var(--card-border)', borderRadius: 10, padding: 12, cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace', fontSize: 12 }}>{o.id}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{o.date}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.product}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{o.qty} {o.units}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>👤 {o.assignee}</div>
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
// BOM TAB
// ─────────────────────────────────────────────
function BomTab({ currentUser, products }) {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'System Administrator';
  const canEdit = isAdmin || currentUser?.role === 'MANUFACTURING_USER';

  const fetchBoms = useCallback(() => {
    setLoading(true);
    apiFetch('/boms').then(r => r.ok ? r.json() : []).then(d => { setBoms(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  useEffect(() => { fetchBoms(); }, [fetchBoms]);

  const filtered = boms.filter(b => !search || b.product?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {showForm && (
        <BomForm bom={selected} products={products} onClose={() => { setShowForm(false); setSelected(null); }} onSaved={fetchBoms} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <input className="filter-control-input" placeholder="Search BOMs..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{filtered.length} BOMs</span>
          {canEdit && <button onClick={() => { setSelected(null); setShowForm(true); }} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ New BOM</button>}
        </div>
      </div>
      <div className="sf-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="sf-table" style={{ fontSize: 13 }}>
          <thead><tr>{['BOM ID', 'Reference', 'Product', 'Components', 'Work Orders', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><Spinner /></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No BOMs found</td></tr>
                : filtered.map((b, i) => (
                  <motion.tr key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="sf-table-row-hover">
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', fontSize: 12 }}>{b.id}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{b.reference || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{b.product}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{b.components?.length || 0} items</td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{(b.workOrders || b.work_orders)?.length || 0} ops</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {canEdit && <button className="sf-btn" onClick={() => { setSelected(b); setShowForm(true); }}>Edit</button>}
                        {canEdit && <button onClick={async () => {
                          if (!window.confirm('Delete this BOM?')) return;
                          await apiFetch(`/boms/${b.id}`, { method: 'DELETE' });
                          toast.success('BOM deleted'); fetchBoms();
                        }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>Del</button>}
                      </div>
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// BOM Form Modal
function BomForm({ bom, products, onClose, onSaved }) {
  const isNew = !bom;
  const [ref, setRef] = useState(bom?.reference || '');
  const [product, setProduct] = useState(bom?.product || '');
  const [components, setComponents] = useState(bom?.components || [{ name: '', qty: 1, unit: 'Units' }]);
  const [workOrders, setWorkOrders] = useState((bom?.workOrders || bom?.work_orders || [{ operation: 'Cutting', workCenter: 'Pre-Production', duration: 60 }]));
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!product.trim()) { toast.error('Product name required'); return; }
    setSaving(true);
    const count = await apiFetch('/boms').then(r => r.json()).then(d => d.length).catch(() => 0);
    const body = { id: bom?.id || `BOM-${String(count + 1).padStart(3, '0')}`, reference: ref, product, components, workOrders };
    try {
      let res;
      if (isNew) res = await apiFetch('/boms', { method: 'POST', body: JSON.stringify(body) });
      else res = await apiFetch(`/boms/${bom.id}`, { method: 'PUT', body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success !== false) { toast.success(isNew ? 'BOM created!' : 'BOM updated!'); onSaved(); onClose(); }
      else toast.error(data.message || 'Failed');
    } catch { toast.error('Server unreachable'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        style={{ background: 'var(--card-bg)', borderRadius: 16, padding: 30, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22, borderBottom: '1px solid var(--card-border)', paddingBottom: 14 }}>
          <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>{isNew ? 'New BOM Template' : `Edit ${bom.id}`}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Product / Finished Good *</label>
              {products.length > 0 ? (
                <select className="filter-control-select" value={product} onChange={e => setProduct(e.target.value)} style={{ width: '100%', fontSize: 15 }}>
                  <option value="">— Select Product —</option>
                  {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              ) : (
                <input className="filter-control-input" value={product} onChange={e => setProduct(e.target.value)} style={{ width: '100%' }} />
              )}
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Reference Code</label>
              <input className="filter-control-input" value={ref} onChange={e => setRef(e.target.value)} style={{ width: '100%' }} placeholder="e.g. WC-001" />
            </div>
          </div>
          {/* Components */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>🧱 COMPONENTS</label>
              <button type="button" onClick={() => setComponents(p => [...p, { name: '', qty: 1, unit: 'Units' }])} style={{ background: '#fef3c7', color: '#b45309', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>+ Add</button>
            </div>
            {components.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                {products.length > 0 ? (
                  <select className="filter-control-select" value={c.name} onChange={e => { const n = [...components]; n[i].name = e.target.value; setComponents(n); }}>
                    <option value="">— Material —</option>
                    {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
                ) : (
                  <input className="filter-control-input" value={c.name} onChange={e => { const n = [...components]; n[i].name = e.target.value; setComponents(n); }} placeholder="Material name" />
                )}
                <input type="number" className="filter-control-input" value={c.qty} onChange={e => { const n = [...components]; n[i].qty = parseFloat(e.target.value) || 0; setComponents(n); }} placeholder="Qty" min={0} />
                <select className="filter-control-select" value={c.unit || 'Units'} onChange={e => { const n = [...components]; n[i].unit = e.target.value; setComponents(n); }}>
                  {['Units', 'Kg', 'Meters', 'Pcs', 'Liters', 'Sq. Ft'].map(u => <option key={u}>{u}</option>)}
                </select>
                <button type="button" onClick={() => setComponents(p => p.filter((_, idx) => idx !== i))} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>✕</button>
              </div>
            ))}
          </div>
          {/* Work Orders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>⚙️ WORK ORDERS / OPERATIONS</label>
              <button type="button" onClick={() => setWorkOrders(p => [...p, { operation: '', workCenter: 'Assembly Line', duration: 60 }])} style={{ background: '#fef3c7', color: '#b45309', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>+ Add</button>
            </div>
            {workOrders.map((w, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: 8, marginBottom: 8 }}>
                <input className="filter-control-input" value={w.operation} onChange={e => { const n = [...workOrders]; n[i].operation = e.target.value; setWorkOrders(n); }} placeholder="Operation name" />
                <select className="filter-control-select" value={w.workCenter} onChange={e => { const n = [...workOrders]; n[i].workCenter = e.target.value; setWorkOrders(n); }}>
                  {['Pre-Production', 'Assembly Line', 'Finishing Line', 'Upholstery Dept', 'Quality Control', 'Packaging'].map(wc => <option key={wc}>{wc}</option>)}
                </select>
                <input type="number" className="filter-control-input" value={w.duration} onChange={e => { const n = [...workOrders]; n[i].duration = parseInt(e.target.value) || 0; setWorkOrders(n); }} placeholder="Mins" min={0} />
                <button type="button" onClick={() => setWorkOrders(p => p.filter((_, idx) => idx !== i))} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>✕</button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid var(--card-border)' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {saving ? 'Saving...' : isNew ? 'Create BOM' : 'Update BOM'}
            </button>
            <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--card-border)', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
function ManufacturingOrders({ onNavigate, currentUser }) {
  const role = currentUser?.role || 'PENDING';
  const isAdmin = role === 'ADMIN' || role === 'System Administrator';
  const isMfg = role === 'MANUFACTURING_USER';
  const isOwner = role === 'BUSINESS_OWNER';
  const hasAccess = isAdmin || isMfg || isOwner;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!hasAccess) return;
    apiFetch('/boms').then(r => r.ok ? r.json() : []).then(setBoms).catch(() => {});
    apiFetch('/products').then(r => r.ok ? r.json() : []).then(setProducts).catch(() => {});
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 60, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 32 }}>🔒</div>
        <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800 }}>Manufacturing Module — Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 420, fontSize: 14, lineHeight: 1.6 }}>
          Your role (<strong>{role}</strong>) does not have access to Manufacturing. Contact your Admin to be assigned the <strong>Manufacturing User</strong> role.
        </p>
        <button onClick={() => onNavigate('dashboard')} style={{ marginTop: 24, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'orders', label: '⚙️ Manufacturing Orders' },
    { id: 'bom', label: '📋 Bill of Materials' },
  ];

  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>Manufacturing Module</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>Production planning, BOM management, work orders, quality control</p>
        </div>
        <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#b45309', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid #fcd34d' }}>
          🟡 ERP Connected
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--card-border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 20px', fontSize: 14, fontWeight: 700,
              color: activeTab === tab.id ? '#f59e0b' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid #f59e0b' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.2s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === 'dashboard' && <ManufacturingDashboard onNavigateToOrders={() => setActiveTab('orders')} />}
          {activeTab === 'orders' && <ManufacturingOrdersTab currentUser={currentUser} boms={boms} products={products} />}
          {activeTab === 'bom' && <BomTab currentUser={currentUser} products={products} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ManufacturingOrders;
