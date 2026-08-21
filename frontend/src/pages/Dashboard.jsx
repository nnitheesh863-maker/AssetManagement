import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUpModule from 'react-countup';
const CountUp = CountUpModule.default ? CountUpModule.default : CountUpModule;
import './Dashboard.css';

function Dashboard({ currentUser, onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartFilter, setChartFilter] = useState('7 Days');
  const [hoveredBar, setHoveredBar] = useState(null);

  const role = currentUser?.role || 'PENDING';

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      // Use mock data for instant loading
      const mockAnalytics = {
        user: { name: currentUser?.name || currentUser?.loginId || 'Admin' },
        kpis: {
          totalSales: 15450000,
          purchaseOrdersCount: 24,
          pendingPurchasesCount: 6,
          manufacturingOrdersCount: 15,
          inProgressCount: 5,
          lowStockCount: 4,
          pendingUsersCount: 2
        },
        charts: {
          salesTrend: [
            { fullDate: 'Mon', label: 'Mon', total: 120000 },
            { fullDate: 'Tue', label: 'Tue', total: 250000 },
            { fullDate: 'Wed', label: 'Wed', total: 180000 },
            { fullDate: 'Thu', label: 'Thu', total: 320000 },
            { fullDate: 'Fri', label: 'Fri', total: 290000 },
            { fullDate: 'Sat', label: 'Sat', total: 410000 },
            { fullDate: 'Sun', label: 'Sun', total: 380000 }
          ],
          orderStatus: { Delivered: 45, Confirmed: 22, Late: 5 }
        },
        recentActivity: [
          { id: 1, text: 'Sales order #SO-001 created', time: '10 mins ago' },
          { id: 2, text: 'Purchase order #PO-002 confirmed', time: '1 hour ago' },
          { id: 3, text: 'Raw Teak Lumber fell below minimum stock', time: '2 hours ago' },
          { id: 4, text: 'Manufacturing #MO-003 completed', time: '3 hours ago' },
          { id: 5, text: 'New user Amit_S registered', time: '4 hours ago' }
        ],
        lowStockAlerts: [
          { id: 1, name: 'Premium Wood Glue', available: 5, minimum: 20, shortage: 15 },
          { id: 2, name: 'Steel Screws Pack', available: 10, minimum: 50, shortage: 40 }
        ]
      };
      
      setTimeout(() => {
        setAnalytics(mockAnalytics);
        setLoading(false);
      }, 300); // slight delay for smooth transition effect
    };
    fetchAnalytics();
  }, [currentUser]);

  // Dynamic Chart Rendering calculations based on analytics data
  const chartData = useMemo(() => {
    if (!analytics?.charts?.salesTrend) return [];
    
    const rawData = analytics.charts.salesTrend;
    const maxTotal = Math.max(...rawData.map(d => d.total), 100);
    const daysToShow = rawData.length;
    const availableWidth = 460;
    const spacing = daysToShow > 0 ? availableWidth / daysToShow : 50;
    const barWidth = Math.max(spacing * 0.6, 6);

    return rawData.map((d, i) => {
      const heightRatio = d.total / maxTotal;
      const barHeight = Math.max(heightRatio * 140, 5); 
      const y = 170 - barHeight;
      const x = 20 + i * spacing;
      return { ...d, barHeight, y, x, barWidth, index: i };
    });
  }, [analytics]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const chartVariants = {
    hidden: { scaleY: 0, transformOrigin: 'bottom' },
    show: { scaleY: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  // Rendering Shimmer Loading state
  if (loading) {
    return (
      <div className="shimmer-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer-card sf-panel" style={{ height: '110px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
              <div className="shimmer-wave"></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          <div className="shimmer-card sf-panel" style={{ height: '280px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
            <div className="shimmer-wave"></div>
          </div>
          <div className="shimmer-card sf-panel" style={{ height: '280px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', position: 'relative', overflow: 'hidden' }}>
            <div className="shimmer-wave"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--sf-danger)' }}>
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '600' }}>{error}</p>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const recentActivity = analytics?.recentActivity || [];

  return (
    <>
      <svg width="0" height="0">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.5)" />
            <stop offset="100%" stopColor="rgba(212, 175, 55, 0)" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* WELCOME BANNER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--sf-text)' }}>Welcome Back, {analytics?.user?.name || 'User'}</h1>
            <p style={{ color: 'var(--sf-text-muted)', fontSize: '13px' }}>Here is the current operating review for your role as <span style={{ color: 'var(--sf-gold)', fontWeight: '600' }}>{role}</span></p>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--sf-text-muted)', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--sf-panel-border)' }}>
            System Status: <span style={{ color: 'var(--sf-success)', fontWeight: '700' }}>Active</span>
          </div>
        </div>

        {/* PENDING ROLE SPECIFIC BANNER */}
        {role === 'PENDING' && (
          <motion.div className="sf-panel" variants={cardVariants} style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" fill="none" stroke="var(--sf-gold)" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--sf-text)' }}>Account Pending Activation</h4>
              <p style={{ margin: '4px 0 0 0', color: 'var(--sf-text-muted)', fontSize: '13px', lineHeight: '1.5' }}>
                Welcome! Your account is currently awaiting role assignment and module activations by a System Administrator. 
                You have read-only visibility to the general dashboard, but access to other modules (Sales, Purchase, Manufacturing, Inventory) will remain locked until your role is configured.
              </p>
            </div>
          </motion.div>
        )}

        {/* ROLE-BASED KPI CARDS */}
        <motion.div className="sf-kpi-grid" variants={containerVariants}>
          
          {/* SALES CARD */}
          {(role === 'System Administrator' || role === 'ADMIN' || role === 'BUSINESS_OWNER' || role === 'SALES_USER') && (
            <motion.div className="sf-kpi-card inverted" variants={cardVariants}>
              <div className="sf-kpi-header">
                <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Total Revenue
              </div>
              <div className="sf-kpi-value">₹<CountUp end={kpis.totalSales || 0} duration={1.5} separator="," /></div>
              <div className="sf-kpi-footer">
                <span className="sf-kpi-trend positive">+8.4%</span>
                <span className="sf-kpi-subtext">vs last week</span>
              </div>
            </motion.div>
          )}

          {role === 'SALES_USER' && (
            <motion.div className="sf-kpi-card inverted" variants={cardVariants}>
              <div className="sf-kpi-header">
                <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                My Sales Orders
              </div>
              <div className="sf-kpi-value"><CountUp end={kpis.mySalesOrdersCount || 0} duration={1.2} /></div>
              <div className="sf-kpi-footer">
                <span className="sf-kpi-trend info">{kpis.confirmedOrdersCount || 0} Confirmed</span>
              </div>
            </motion.div>
          )}

          {/* PURCHASE CARD */}
          {(role === 'System Administrator' || role === 'ADMIN' || role === 'BUSINESS_OWNER' || role === 'PURCHASE_USER') && (
            <motion.div className="sf-kpi-card" variants={cardVariants}>
              <div className="sf-kpi-header">
                <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Purchase Orders
              </div>
              <div className="sf-kpi-value"><CountUp end={kpis.purchaseOrdersCount || 0} duration={1.2} /></div>
              <div className="sf-kpi-footer">
                <span className="sf-kpi-trend warning">{kpis.pendingPurchasesCount || 0} Pending</span>
              </div>
            </motion.div>
          )}

          {/* MANUFACTURING CARD */}
          {(role === 'System Administrator' || role === 'ADMIN' || role === 'BUSINESS_OWNER' || role === 'MANUFACTURING_USER') && (
            <motion.div className="sf-kpi-card" variants={cardVariants}>
              <div className="sf-kpi-header">
                <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                Manufacturing
              </div>
              <div className="sf-kpi-value"><CountUp end={kpis.manufacturingOrdersCount || kpis.mfgOrdersCount || 0} duration={1.2} /></div>
              <div className="sf-kpi-footer">
                <span className="sf-kpi-trend info">{kpis.inProgressCount || 0} In Progress</span>
              </div>
            </motion.div>
          )}

          {/* INVENTORY / LOW STOCK CARD */}
          {(role === 'System Administrator' || role === 'ADMIN' || role === 'BUSINESS_OWNER' || role === 'INVENTORY_MANAGER') && (
            <motion.div className="sf-kpi-card" variants={cardVariants}>
              <div className="sf-kpi-header">
                <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Low Stock Items
              </div>
              <div className="sf-kpi-value"><CountUp end={kpis.lowStockCount || kpis.lowStockItemsCount || 0} duration={1.2} /></div>
              <div className="sf-kpi-footer">
                <span className="sf-kpi-trend danger">Alerts Active</span>
              </div>
            </motion.div>
          )}

          {/* INVENTORY VALUE CARD (INVENTORY ONLY) */}
          {role === 'INVENTORY_MANAGER' && (
            <motion.div className="sf-kpi-card inverted" variants={cardVariants}>
              <div className="sf-kpi-header">
                <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Total Items On Hand
              </div>
              <div className="sf-kpi-value"><CountUp end={kpis.totalOnHand || 0} duration={1.5} /></div>
              <div className="sf-kpi-footer">
                <span className="sf-kpi-trend positive">{kpis.freeToUse || 0} Free to Use</span>
              </div>
            </motion.div>
          )}

          {/* USERS CARD (ADMIN ONLY) */}
          {(role === 'ADMIN' || role === 'System Administrator') && (
            <motion.div className="sf-kpi-card" variants={cardVariants}>
              <div className="sf-kpi-header">
                <svg className="sf-kpi-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Pending Users
              </div>
              <div className="sf-kpi-value"><CountUp end={kpis.pendingUsersCount || 0} duration={1.2} /></div>
              <div className="sf-kpi-footer">
                <span className="sf-kpi-trend warning" onClick={() => onNavigate('users')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Review Now</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* SECTION 2: CHARTS & STATS (ALL ROLES) */}
        {role && (
          <motion.div className="sf-analytics-row" variants={containerVariants}>
            
            {/* Sales Bar Chart */}
            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 2 }}>
              <div className="sf-panel-header">
                <h2 className="sf-panel-title">Sales Trend</h2>
                <select 
                  value={chartFilter}
                  onChange={(e) => setChartFilter(e.target.value)}
                  style={{ background: 'var(--sf-bg)', color: 'var(--sf-text-muted)', border: '1px solid var(--sf-panel-border)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
                >
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                </select>
              </div>
              
              <div style={{ position: 'relative', height: '220px', marginTop: '10px' }}>
                <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '30px' }}>
                  {[4,3,2,1,0].map(i => <div key={i} style={{ borderBottom: '1px dashed var(--sf-panel-border)', width: '100%' }}></div>)}
                </div>
                
                {chartData.length > 0 ? (
                  <svg className="sf-chart-svg" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                    {chartData.map((d) => (
                      <React.Fragment key={d.index}>
                        <rect className="sf-bar-bg" x={d.x} y="20" width={d.barWidth} height="150" />
                        <motion.rect 
                          className="sf-bar" 
                          x={d.x} 
                          y={d.y} 
                          width={d.barWidth} 
                          height={d.barHeight} 
                          variants={chartVariants} 
                          initial="hidden" 
                          animate="show"
                          onMouseEnter={() => setHoveredBar(d.index)}
                          onMouseLeave={() => setHoveredBar(null)}
                          style={{ cursor: 'pointer' }}
                        />
                        <text x={d.x + (d.barWidth / 2)} y="195" fontSize="10" fill={hoveredBar === d.index ? "var(--sf-gold)" : "var(--sf-text-muted)"} textAnchor="middle">{d.label}</text>
                      </React.Fragment>
                    ))}
                  </svg>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--sf-text-muted)' }}>No sales data available</div>
                )}
                
                {hoveredBar !== null && chartData[hoveredBar] && (
                  <div style={{ position: 'absolute', top: '10px', left: `${Math.min(chartData[hoveredBar].x, 380)}px`, background: 'var(--sf-panel-bg)', border: '1px solid var(--sf-panel-border)', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10 }}>
                    <div style={{ color: 'var(--sf-text-muted)' }}>{chartData[hoveredBar].fullDate} Sales</div>
                    <div style={{ color: 'var(--sf-text)', fontWeight: '700', fontSize: '13px' }}>₹{chartData[hoveredBar].total.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Donut Chart */}
            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
              <div className="sf-panel-header">
                <h2 className="sf-panel-title">Order Status</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', position: 'relative' }}>
                <svg className="sf-donut-svg" viewBox="0 0 100 100" style={{ width: '130px', height: '130px' }}>
                  <circle className="sf-donut-bg" cx="50" cy="50" r="40" />
                  <circle className="sf-donut-segment" cx="50" cy="50" r="40" stroke="var(--sf-success)" strokeDasharray="250" strokeDashoffset="80" />
                  <circle className="sf-donut-segment" cx="50" cy="50" r="40" stroke="var(--sf-gold)" strokeDasharray="250" strokeDashoffset="180" />
                  <circle className="sf-donut-segment" cx="50" cy="50" r="40" stroke="var(--sf-danger)" strokeDasharray="250" strokeDashoffset="220" />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontSize: '10px', color: 'var(--sf-text-muted)' }}>Total Orders</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--sf-text)' }}>{analytics?.charts?.orderStatus ? (Object.values(analytics.charts.orderStatus).reduce((a,b)=>a+b, 0)) : 0}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--sf-text-muted)', marginTop: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap:'6px' }}><div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--sf-success)' }}></div>Delivered</div>
                  <span style={{ color: 'var(--sf-text)', fontWeight: '600' }}>{analytics?.charts?.orderStatus?.Delivered || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap:'6px' }}><div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--sf-gold)' }}></div>Confirmed</div>
                  <span style={{ color: 'var(--sf-text)', fontWeight: '600' }}>{analytics?.charts?.orderStatus?.Confirmed || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap:'6px' }}><div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--sf-danger)' }}></div>Late</div>
                  <span style={{ color: 'var(--sf-text)', fontWeight: '600' }}>{analytics?.charts?.orderStatus?.Late || 0}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* SALES USER OPERATIONAL PANELS */}
        {role === 'SALES_USER' && (
          <motion.div className="sf-analytics-row" variants={containerVariants}>
            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>My Recent Sales Orders</h2>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.recentOrders || []).map(o => (
                      <tr key={o.id}>
                        <td style={{ color: 'var(--sf-gold)', fontWeight: '600' }}>{o.id}</td>
                        <td>{o.customer}</td>
                        <td>₹{o.total}</td>
                        <td><span className={`sf-badge ${o.status.toLowerCase()}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>Product Stock Availability</h2>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Free to Use Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.stockAvailability || []).map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td style={{ fontWeight: '700', color: p.available > 5 ? 'var(--sf-success)' : 'var(--sf-danger)' }}>{p.available} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* PURCHASE USER OPERATIONAL PANELS */}
        {role === 'PURCHASE_USER' && (
          <motion.div className="sf-analytics-row" variants={containerVariants}>
            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>Recent Purchase Orders</h2>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Supplier</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.recentPurchases || []).map(po => (
                      <tr key={po.id}>
                        <td style={{ color: 'var(--sf-gold)', fontWeight: '600' }}>{po.id}</td>
                        <td>{po.vendor}</td>
                        <td>{po.item}</td>
                        <td>{po.qty}</td>
                        <td><span className={`sf-badge ${po.status.toLowerCase().replace(' ', '')}`}>{po.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>Procurement Shortages</h2>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Available</th>
                      <th>Min Limit</th>
                      <th>Shortage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.procurementReqs || []).map(p => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.available}</td>
                        <td>{p.minimum}</td>
                        <td style={{ color: 'var(--sf-danger)', fontWeight: '700' }}>+{p.shortage} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MANUFACTURING USER OPERATIONAL PANELS */}
        {role === 'MANUFACTURING_USER' && (
          <motion.div className="sf-analytics-row" variants={containerVariants}>
            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 2 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>Active Production Pipeline</h2>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Assignee</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.pipeline || []).map(mo => (
                      <tr key={mo.id}>
                        <td style={{ color: 'var(--sf-gold)', fontWeight: '600' }}>{mo.id}</td>
                        <td>{mo.product}</td>
                        <td>{mo.qty}</td>
                        <td>{mo.assignee}</td>
                        <td><span className={`sf-badge ${mo.status.toLowerCase()}`}>{mo.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>Component Shortages</h2>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Shortage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.materialShortages || []).map((ms, i) => (
                      <tr key={i}>
                        <td>{ms.name}</td>
                        <td style={{ color: 'var(--sf-danger)', fontWeight: '700' }}>+{ms.shortage} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* INVENTORY MANAGER OPERATIONAL PANELS */}
        {role === 'INVENTORY_MANAGER' && (
          <motion.div className="sf-analytics-row" variants={containerVariants}>
            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 2 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>Inventory Stock List</h2>
              <div className="sf-table-wrapper">
                <table className="sf-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>On Hand</th>
                      <th>Reserved</th>
                      <th>Free to Use</th>
                      <th>Minimum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analytics?.inventoryList || []).map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.onHand}</td>
                        <td>{item.reserved}</td>
                        <td style={{ fontWeight: '700', color: item.freeToUse > item.minimum ? 'var(--sf-success)' : 'var(--sf-danger)' }}>{item.freeToUse}</td>
                        <td>{item.minimum}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
              <h2 className="sf-panel-title" style={{ marginBottom: '12px' }}>Low Stock Warnings</h2>
              <div className="sf-activity-feed">
                {(analytics?.lowStockAlerts || []).map(alert => (
                  <div className="sf-activity-item" key={alert.id} style={{ borderLeft: '3px solid var(--sf-danger)', paddingLeft: '8px' }}>
                    <div className="sf-act-content">
                      <span className="sf-act-desc" style={{ color: 'var(--sf-text)' }}>{alert.name} is below limit</span>
                      <span className="sf-act-meta" style={{ color: 'var(--sf-danger)' }}>Shortage: {alert.shortage} units (On Hand: {alert.available})</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* GENERAL TABLES FOR ALL ROLES */}
        {role && (
          <>
            <motion.div className="sf-analytics-row" variants={containerVariants}>
              <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 2 }}>
                <div className="sf-panel-header" style={{ marginBottom: '12px' }}>
                  <h2 className="sf-panel-title">Low Stock Alerts & Procurement Pipeline</h2>
                </div>
                <div className="sf-table-wrapper">
                  <table className="sf-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>On Hand</th>
                        <th>Minimum Limit</th>
                        <th>Procurement Strategy</th>
                        <th>Shortage Trigger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.lowStockAlerts || []).map(p => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td style={{ fontWeight: '700', color: 'var(--sf-danger)' }}>{p.available} units</td>
                          <td>{p.minimum} units</td>
                          <td><span className="sf-badge info">{p.available < p.minimum ? 'Auto-Triggered' : 'Normal'}</span></td>
                          <td style={{ color: 'var(--sf-danger)', fontWeight: '700' }}>+{p.shortage} units needed</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div className="sf-panel" variants={cardVariants} style={{ flex: 1 }}>
                <h2 className="sf-panel-title" style={{ marginBottom: '16px' }}>Audit Log Feed</h2>
                <div className="sf-activity-feed">
                  {recentActivity.slice(0, 5).map((act, i) => (
                    <div className="sf-activity-item" key={act.id || i}>
                      <div className="sf-act-icon">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div className="sf-act-content">
                        <span className="sf-act-desc">{act.text}</span>
                        <span className="sf-act-meta">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}


      </motion.div>
    </>
  );
}

export default Dashboard;
