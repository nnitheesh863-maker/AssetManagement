import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../pages/Dashboard.css';
import '../pages/Dashboard.css'; // Use the global enterprise styles

function Sidebar({ currentView, onNavigate, isCollapsed, currentUser }) {
  const sidebarVariants = {
    expanded: { width: 260 },
    collapsed: { width: 72 }
  };

  const textVariants = {
    hidden: { opacity: 0, width: 0, display: 'none', transition: { duration: 0.2 } },
    visible: { opacity: 1, width: 'auto', display: 'block', transition: { duration: 0.2, delay: 0.1 } }
  };

  const NavItem = ({ id, icon, label, style = {} }) => {
    const isActive = currentView === id;
    
    return (
      <div 
        className={`sf-nav-item ${isActive ? 'active' : ''}`} 
        onClick={() => onNavigate(id)} 
        style={{ padding: isCollapsed ? '10px 24px' : '10px 24px', position: 'relative', zIndex: 1, ...style }}
      >
        {isActive && (
          <motion.div
            layoutId="active-sidebar-tab"
            style={{ position: 'absolute', inset: 0, backgroundColor: '#f3f4f6', borderRadius: '8px', zIndex: -1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 2, position: 'relative' }}>
          {icon}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span variants={textVariants} initial="hidden" animate="visible" exit="hidden" style={{ whiteSpace: 'nowrap' }}>
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <motion.div 
      className="sf-sidebar" 
      variants={sidebarVariants} 
      initial={isCollapsed ? "collapsed" : "expanded"} 
      animate={isCollapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ overflowX: 'hidden' }}
    >
      <div className="sf-logo" style={{ padding: isCollapsed ? '0 16px 24px 16px' : '0 24px 24px 24px' }}>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div variants={textVariants} initial="hidden" animate="visible" exit="hidden" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="sf-logo-title">SHIV FURNITURE</span>
              <span className="sf-logo-sub">ERP System</span>
            </motion.div>
          )}
        </AnimatePresence>
        {isCollapsed && (
          <div style={{ textAlign: 'center', color: 'var(--sf-text)', fontWeight: '800', fontSize: '20px' }}>SF</div>
        )}
      </div>
      
      <AnimatePresence>
        {!isCollapsed && <motion.div className="sf-nav-section" variants={textVariants} initial="hidden" animate="visible" exit="hidden">General</motion.div>}
      </AnimatePresence>
      <NavItem 
        id="dashboard" 
        label="Dashboard" 
        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} 
      />
      
      <AnimatePresence>
        {!isCollapsed && <motion.div className="sf-nav-section" style={{marginTop: '10px'}} variants={textVariants} initial="hidden" animate="visible" exit="hidden">Operations</motion.div>}
      </AnimatePresence>
      <NavItem 
        id="sales-orders" 
        label="Sales Orders" 
        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} 
      />
      <NavItem 
        id="purchase-orders" 
        label="Purchase Orders" 
        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} 
      />
      <NavItem 
        id="manufacturing-orders" 
        label="Manufacturing Orders" 
        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>} 
      />
      <NavItem 
        id="bom" 
        label="Bills of Materials" 
        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} 
      />
      <NavItem 
        id="products" 
        label="Products" 
        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} 
      />

      <AnimatePresence>
        {!isCollapsed && <motion.div className="sf-nav-section" style={{marginTop: '10px'}} variants={textVariants} initial="hidden" animate="visible" exit="hidden">Management</motion.div>}
      </AnimatePresence>
      <NavItem 
        id="audit-logs" 
        label="Audit Logs" 
        icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
      />
    </motion.div>
  );
}

export default Sidebar;
