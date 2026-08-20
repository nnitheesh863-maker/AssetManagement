import React, { useState, useEffect } from 'react';
import { mockDashboardData } from '../data/mockData';

// Supply items prices map
const SUPPLY_PRICES = {
  'Teak Veneer': 45,
  'Raw Lumber': 120,
  'Drawer handles': 12,
  'Wood Glue': 8,
  'Pendant lights': 150
};

// Responsible Person (System users)
const RESPONSIBLE_LIST = ['Meera Sen', 'Amit Sharma', 'Ravi Verma', 'Neha Verma'];

// Vendors list
const VENDOR_LIST = ['Raw Teak Supplier Co.', 'Hardware Supplies Depot', 'Global Glass & Lighting Inc.'];

function PurchaseOrders({ onNavigate }) {
  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('assetflow_purchase_orders');
    if (saved) return JSON.parse(saved);
    return mockDashboardData.purchaseOrders.map(o => ({
      id: o.id,
      date: o.date,
      vendor: VENDOR_LIST[0],
      address: 'Goregaon East, Mumbai, 400063',
      agent: o.owner,
      product: o.name,
      price: parseInt(o.amount.replace(/[^0-9]/g, '')) || 120,
      qty: 10,
      received: o.status === 'Received' ? 10 : 0,
      status: o.status === 'Received' ? 'Fully Received' : o.status
    }));
  });
  const [activeView, setActiveView] = useState('list'); // 'list' | 'kanban' | 'form'
  const [selectedOrder, setSelectedOrder] = useState(null); // null for new order
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields State
  const [vendorName, setVendorName] = useState(VENDOR_LIST[0]);
  const [vendorAddress, setVendorAddress] = useState('Goregaon East, Mumbai, 400063');
  const [responsiblePerson, setResponsiblePerson] = useState(RESPONSIBLE_LIST[0]);
  const [selectedItem, setSelectedItem] = useState('Teak Veneer');
  const [orderedQty, setOrderedQty] = useState(10);
  const [receivedQty, setReceivedQty] = useState(0);
  const [orderStatus, setOrderStatus] = useState('Draft');
  const [orderDate, setOrderDate] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  const syncToBackend = (method, endpoint, bodyObj) => {
    fetch(`${API_BASE_URL}/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj)
    }).catch(err => console.warn(`Failed to sync ${method} ${endpoint} to backend:`, err));
  };

  const createAuditLog = (action, orderId) => {
    const today = new Date();
    const formattedDate = today.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    const logObj = {
      datetime: formattedDate,
      user: responsiblePerson || 'Amit Sharma',
      module: 'Purchase',
      type: 'Purchase Order',
      id: orderId,
      action,
      field: '-',
      oldVal: '-',
      newVal: '-'
    };
    
    syncToBackend('POST', 'audit-logs', {
      datetime: logObj.datetime,
      user: logObj.user,
      module: logObj.module,
      type: logObj.type,
      record_id: logObj.id,
      action: logObj.action,
      field: logObj.field,
      old_val: logObj.oldVal,
      new_val: logObj.newVal
    });
  };

  // Load orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/purchase-orders`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const formatted = data.map(r => ({
              id: r.id,
              date: r.date,
              vendor: r.vendor,
              address: r.address,
              agent: r.responsible,
              product: r.item,
              price: SUPPLY_PRICES[r.item] || 100,
              qty: r.qty,
              received: r.received,
              status: r.status,
              owner: r.owner || ''
            }));
            setPurchaseOrders(formatted);
            localStorage.setItem('assetflow_purchase_orders', JSON.stringify(formatted));
            return;
          }
        }
      } catch (err) {
        console.warn("Backend server not reachable. Using localStorage.", err);
      }

      const saved = localStorage.getItem('assetflow_purchase_orders');
      if (saved) {
        setPurchaseOrders(JSON.parse(saved));
      } else {
        const initial = mockDashboardData.purchaseOrders.map(o => ({
          id: o.id,
          date: o.date,
          vendor: VENDOR_LIST[0],
          address: 'Goregaon East, Mumbai, 400063',
          agent: o.owner,
          product: o.name,
          price: parseInt(o.amount.replace(/[^0-9]/g, '')) || 120,
          qty: 10,
          received: o.status === 'Received' ? 10 : 0,
          status: o.status === 'Received' ? 'Fully Received' : o.status
        }));
        setPurchaseOrders(initial);
        localStorage.setItem('assetflow_purchase_orders', JSON.stringify(initial));
      }
    };

    fetchOrders();
  }, []);

  // Sync to local storage
  const saveOrders = (updatedList) => {
    setPurchaseOrders(updatedList);
    localStorage.setItem('assetflow_purchase_orders', JSON.stringify(updatedList));
  };

  // Open Form for editing
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setVendorName(order.vendor);
    setVendorAddress(order.address);
    setResponsiblePerson(order.agent);
    setSelectedItem(order.product);
    setOrderedQty(order.qty);
    setReceivedQty(order.received || 0);
    setOrderStatus(order.status);
    setOrderDate(order.date);
    setActiveView('form');
  };

  // Open Form for creating new
  const handleNewOrder = () => {
    setSelectedOrder(null);
    setVendorName(VENDOR_LIST[0]);
    setVendorAddress('Goregaon East, Mumbai, 400063');
    setResponsiblePerson(RESPONSIBLE_LIST[0]);
    setSelectedItem('Teak Veneer');
    setOrderedQty(10);
    setReceivedQty(0);
    setOrderStatus('Draft');
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    setOrderDate(today);
    setActiveView('form');
  };

  // Save changes from form
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!vendorName || !vendorAddress) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const price = SUPPLY_PRICES[selectedItem] || 100;

    if (selectedOrder) {
      // Edit existing
      const updated = purchaseOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = {
            ...o,
            vendor: vendorName,
            address: vendorAddress,
            agent: responsiblePerson,
            product: selectedItem,
            qty: orderedQty,
            received: receivedQty,
            price,
            status: orderStatus
          };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            vendor: updatedObj.vendor,
            address: updatedObj.address,
            responsible: updatedObj.agent,
            item: updatedObj.product,
            qty: updatedObj.qty,
            received: updatedObj.received,
            status: updatedObj.status,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `purchase-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Updated', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    } else {
      // Create new
      const newId = `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
      const newOrder = {
        id: newId,
        date: orderDate,
        vendor: vendorName,
        address: vendorAddress,
        agent: responsiblePerson,
        product: selectedItem,
        qty: orderedQty,
        received: 0,
        price,
        status: 'Draft'
      };

      const backendObj = {
        id: newOrder.id,
        date: newOrder.date,
        vendor: newOrder.vendor,
        address: newOrder.address,
        responsible: newOrder.agent,
        item: newOrder.product,
        qty: newOrder.qty,
        received: newOrder.received,
        status: newOrder.status,
        owner: ''
      };
      syncToBackend('POST', 'purchase-orders', backendObj);
      createAuditLog('Created', newOrder.id);
      saveOrders([...purchaseOrders, newOrder]);
    }

    setActiveView('list');
  };

  // Transitions
  const handleConfirmOrder = () => {
    setOrderStatus('Confirmed');
    if (selectedOrder) {
      const updated = purchaseOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'Confirmed' };
          
          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            vendor: updatedObj.vendor,
            address: updatedObj.address,
            responsible: updatedObj.agent,
            item: updatedObj.product,
            qty: updatedObj.qty,
            received: updatedObj.received,
            status: updatedObj.status,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `purchase-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Confirmed', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleReceiveOrder = () => {
    let nextStatus = 'Partially Received';
    if (receivedQty >= orderedQty) {
      nextStatus = 'Fully Received';
    }

    setOrderStatus(nextStatus);
    if (selectedOrder) {
      const updated = purchaseOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: nextStatus, received: receivedQty };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            vendor: updatedObj.vendor,
            address: updatedObj.address,
            responsible: updatedObj.agent,
            item: updatedObj.product,
            qty: updatedObj.qty,
            received: updatedObj.received,
            status: updatedObj.status,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `purchase-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Updated Delivery', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleCancelOrder = () => {
    setOrderStatus('Cancelled');
    if (selectedOrder) {
      const updated = purchaseOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'Cancelled' };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            vendor: updatedObj.vendor,
            address: updatedObj.address,
            responsible: updatedObj.agent,
            item: updatedObj.product,
            qty: updatedObj.qty,
            received: updatedObj.received,
            status: updatedObj.status,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `purchase-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Cancelled', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  // Filter orders by search
  const filteredOrders = purchaseOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-calculated fields
  const currentPrice = SUPPLY_PRICES[selectedItem] || 0;
  const isReceivedState = orderStatus === 'Fully Received' || orderStatus === 'Partially Received';
  const totalAmount = isReceivedState ? (receivedQty * currentPrice) : (orderedQty * currentPrice);
  
  // Stock availability check (assume max procurement alert is 50 units)
  const isProcurementWarning = orderedQty > 50;

  // Validation rules lock status checks
  const isFieldsLocked = orderStatus === 'Confirmed' || orderStatus === 'Partially Received' || orderStatus === 'Fully Received' || orderStatus === 'Cancelled';
  const isReceivedQtyEditable = orderStatus === 'Confirmed' || orderStatus === 'Partially Received';

  return (
    <div className="page-content animated fadeIn">
      
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Purchase Orders</h2>
          <p className="sys-desc" style={{ margin: '4px 0 0 0' }}>Manage supply contracts, track raw material deliveries and check vendor accounts</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setActiveView('list')}
            style={{ marginTop: 0 }}
          >
            List View
          </button>
          <button 
            className={`btn ${activeView === 'kanban' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => setActiveView('kanban')}
            style={{ marginTop: 0 }}
          >
            Kanban Board
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNewOrder}
            style={{ marginTop: 0, background: '#2563eb', borderColor: '#2563eb' }}
          >
            ＋ New Purchase Order
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {activeView === 'list' && (
        <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by Reference, vendor or supply item..."
              className="filter-control-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '320px' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {filteredOrders.length} orders
            </span>
          </div>

          <div className="table-container-scroll">
            <table className="erp-dashboard-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Responsible Person</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id-cell">{order.id}</td>
                      <td>{order.date}</td>
                      <td style={{ fontWeight: '600' }}>{order.vendor}</td>
                      <td>{order.agent}</td>
                      <td>
                        <span className={`status-pill ${
                          order.status === 'Fully Received' ? 'status-active' :
                          order.status === 'Draft' ? 'status-pending-badge' :
                          order.status === 'Cancelled' ? 'status-warning-badge' : 'status-active'
                        }`} style={{ background: order.status === 'Partially Received' ? '#fef3c7' : '', color: order.status === 'Partially Received' ? '#d97706' : '' }}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-small-table" onClick={() => handleEditOrder(order)}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No purchase orders found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. KANBAN VIEW */}
      {activeView === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* Column helper */}
          {['Draft', 'Confirmed', 'Partially Received', 'Fully Received'].map(colStatus => {
            const list = purchaseOrders.filter(o => o.status === colStatus);
            return (
              <div key={colStatus} className="card glass" style={{ padding: '16px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(250, 244, 235, 0.4)' }}>
                <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '2px solid var(--card-border)', paddingBottom: '8px' }}>
                  {colStatus} ({list.length})
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                  {list.map(order => (
                    <div 
                      key={order.id} 
                      onClick={() => handleEditOrder(order)}
                      style={{ 
                        background: '#FFFBF7', 
                        border: '1px solid var(--card-border)', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s'
                      }}
                      className="kanban-card-hover"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace' }}>{order.id}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.date}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{order.vendor}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{order.product}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.02)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {order.qty}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          ${(order.status === 'Fully Received' || order.status === 'Partially Received' ? order.received : order.qty) * order.price}
                        </span>
                      </div>
                    </div>
                  ))}
                  {list.length === 0 && (
                    <div style={{ padding: '24px', border: '1px dashed var(--card-border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      No orders
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. FORM VIEW */}
      {activeView === 'form' && (
        <div className="card glass" style={{ padding: '36px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {selectedOrder ? `Edit Purchase Order ${selectedOrder.id}` : 'New Purchase Order'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => onNavigate('audit-logs', 'Purchase')}
                style={{ marginTop: 0, padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📋 Logs
              </button>
              <span className={`status-pill ${
                orderStatus === 'Fully Received' ? 'status-active' :
                orderStatus === 'Draft' ? 'status-pending-badge' :
                orderStatus === 'Cancelled' ? 'status-warning-badge' : 'status-active'
              }`}>
                Status: {orderStatus}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Vendor Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Vendor / Supplier *</label>
                <select
                  className="filter-control-select"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  disabled={isFieldsLocked}
                >
                  {VENDOR_LIST.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Vendor Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Vendor Address *</label>
                <input
                  type="text"
                  className="filter-control-input"
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                  disabled={isFieldsLocked}
                  required
                />
              </div>

              {/* Responsible Person Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Responsible Person</label>
                <select
                  className="filter-control-select"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  disabled={isFieldsLocked}
                >
                  {RESPONSIBLE_LIST.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Creation Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Creation Date</label>
                <input
                  type="date"
                  className="filter-control-input"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  disabled
                />
              </div>

              {/* Supply Item Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Supply Item</label>
                <select
                  className="filter-control-select"
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  disabled={isFieldsLocked}
                >
                  {Object.keys(SUPPLY_PRICES).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Supply Item Unit Cost */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Cost Price</label>
                <input
                  type="text"
                  className="filter-control-input"
                  value={`$${currentPrice}`}
                  disabled
                  style={{ background: 'rgba(0,0,0,0.03)' }}
                />
              </div>

              {/* Ordered Quantity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Ordered Quantity</label>
                <input
                  type="number"
                  className="filter-control-input"
                  value={orderedQty}
                  onChange={(e) => setOrderedQty(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isFieldsLocked}
                  min={1}
                />
                {isProcurementWarning && (
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '600' }}>
                    ⚠️ Alert: Large procurement order (exceeds 50 items)
                  </span>
                )}
              </div>

              {/* Received Quantity (only editable in Confirmed/Partially Received) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Received Quantity</label>
                <input
                  type="number"
                  className="filter-control-input"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={!isReceivedQtyEditable}
                  min={0}
                />
              </div>

              {/* Total Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Total Cost ({isReceivedState ? 'Received Qty * Cost Price' : 'Ordered Qty * Cost Price'})
                </label>
                <input
                  type="text"
                  className="filter-control-input"
                  value={`$${totalAmount}`}
                  disabled
                  style={{ background: 'rgba(0,0,0,0.03)', fontWeight: '700', fontSize: '16px', color: 'var(--primary)' }}
                />
              </div>

            </div>

            {/* BUTTON BAR */}
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={orderStatus === 'Fully Received' || orderStatus === 'Cancelled'}
                  style={{ marginTop: 0 }}
                >
                  Save Draft
                </button>
                
                {orderStatus === 'Draft' && (
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={handleConfirmOrder}
                    style={{ marginTop: 0, borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    Confirm
                  </button>
                )}

                {(orderStatus === 'Confirmed' || orderStatus === 'Partially Received') && (
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={handleReceiveOrder}
                    style={{ marginTop: 0, background: '#10b981', color: '#fff' }}
                  >
                    Receive
                  </button>
                )}

                {(orderStatus === 'Draft' || orderStatus === 'Confirmed' || orderStatus === 'Partially Received') && (
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={handleCancelOrder}
                    style={{ marginTop: 0, borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setActiveView('list')}
                style={{ marginTop: 0 }}
              >
                Back
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

export default PurchaseOrders;
