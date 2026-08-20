import React, { useState, useEffect } from 'react';
import { mockDashboardData } from '../data/mockData';

// Product prices map
const PRODUCT_PRICES = {
  'Deluxe Oak Dining Table': 1200,
  'Ash Wood Chair Pack': 380,
  'Beech Wood Bedframe': 1100,
  'Cedar Garden Table': 720,
  'Cherry Wood Bookshelf': 950,
  'Birch Coffee Table': 410,
  'Walnut Sideboard': 1500
};

// Users database
const SALESPERSON_LIST = ['Amit Sharma', 'Neha Verma', 'Ravi Patel', 'Meera Singh'];

function SalesOrders({ onNavigate }) {
  const [salesOrders, setSalesOrders] = useState(() => {
    const saved = localStorage.getItem('assetflow_sales_orders');
    if (saved) return JSON.parse(saved);
    return mockDashboardData.salesOrders.map(o => ({
      id: o.id,
      date: o.date,
      customer: o.owner === 'admin123' ? 'System Administrator Client' : 'Mahesh Gupta Furniture',
      address: 'Colaba, Mumbai, 400001',
      salesperson: 'Amit Sharma',
      product: o.name,
      price: parseInt(o.amount.replace(/[^0-9]/g, '')) || 850,
      qty: 1,
      delivered: o.status === 'Delivered' ? 1 : 0,
      status: o.status
    }));
  });
  const [activeView, setActiveView] = useState('list'); // 'list' | 'kanban' | 'form'
  const [selectedOrder, setSelectedOrder] = useState(null); // null for new order
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields State
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [salesperson, setSalesperson] = useState(SALESPERSON_LIST[0]);
  const [selectedProduct, setSelectedProduct] = useState('Deluxe Oak Dining Table');
  const [orderedQty, setOrderedQty] = useState(1);
  const [deliveredQty, setDeliveredQty] = useState(0);
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
      user: salesperson || 'Amit Sharma',
      module: 'Sales',
      type: 'Sales Order',
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
        const res = await fetch(`${API_BASE_URL}/sales-orders`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            const formatted = data.map(b => {
              const item = b.items[0] || {};
              return {
                id: b.id,
                date: b.date,
                customer: b.customer,
                address: item.address || 'Colaba, Mumbai, 400001',
                salesperson: b.salesperson,
                product: item.product || '',
                price: item.price || 0,
                qty: item.qty || 1,
                delivered: item.delivered || 0,
                status: b.status,
                owner: b.owner || ''
              };
            });
            setSalesOrders(formatted);
            localStorage.setItem('assetflow_sales_orders', JSON.stringify(formatted));
            return;
          }
        }
      } catch (err) {
        console.warn("Backend server not reachable. Using localStorage.", err);
      }

      const saved = localStorage.getItem('assetflow_sales_orders');
      if (saved) {
        setSalesOrders(JSON.parse(saved));
      } else {
        const initial = mockDashboardData.salesOrders.map(o => ({
          id: o.id,
          date: o.date,
          customer: o.owner === 'admin123' ? 'System Administrator Client' : 'Mahesh Gupta Furniture',
          address: 'Colaba, Mumbai, 400001',
          salesperson: 'Amit Sharma',
          product: o.name,
          price: parseInt(o.amount.replace(/[^0-9]/g, '')) || 850,
          qty: 1,
          delivered: o.status === 'Delivered' ? 1 : 0,
          status: o.status
        }));
        setSalesOrders(initial);
        localStorage.setItem('assetflow_sales_orders', JSON.stringify(initial));
      }
    };

    fetchOrders();
  }, []);

  // Sync to local storage
  const saveOrders = (updatedList) => {
    setSalesOrders(updatedList);
    localStorage.setItem('assetflow_sales_orders', JSON.stringify(updatedList));
  };

  // Open Form for editing
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setCustomerName(order.customer);
    setCustomerAddress(order.address);
    setSalesperson(order.salesperson);
    setSelectedProduct(order.product);
    setOrderedQty(order.qty);
    setDeliveredQty(order.delivered || 0);
    setOrderStatus(order.status);
    setOrderDate(order.date);
    setActiveView('form');
  };

  // Open Form for creating new
  const handleNewOrder = () => {
    setSelectedOrder(null);
    setCustomerName('');
    setCustomerAddress('');
    setSalesperson(SALESPERSON_LIST[0]);
    setSelectedProduct('Deluxe Oak Dining Table');
    setOrderedQty(1);
    setDeliveredQty(0);
    setOrderStatus('Draft');
    // Set default date
    const today = new Date().toISOString().split('T')[0];
    setOrderDate(today);
    setActiveView('form');
  };

  // Save changes from form
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!customerName || !customerAddress) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const price = PRODUCT_PRICES[selectedProduct] || 800;

    if (selectedOrder) {
      // Edit existing
      const updated = salesOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = {
            ...o,
            customer: customerName,
            address: customerAddress,
            salesperson,
            product: selectedProduct,
            qty: orderedQty,
            delivered: deliveredQty,
            price,
            status: orderStatus
          };
          
          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            customer: updatedObj.customer,
            status: updatedObj.status,
            salesperson: updatedObj.salesperson,
            items: [{
              product: updatedObj.product,
              price: updatedObj.price,
              qty: updatedObj.qty,
              delivered: updatedObj.delivered,
              address: updatedObj.address
            }],
            total: (updatedObj.status === 'Delivered' || updatedObj.status === 'Partially Delivered' ? updatedObj.delivered : updatedObj.qty) * updatedObj.price,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `sales-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Updated', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    } else {
      // Create new
      const newId = `SO-${String(salesOrders.length + 1).padStart(3, '0')}`;
      const newOrder = {
        id: newId,
        date: orderDate,
        customer: customerName,
        address: customerAddress,
        salesperson,
        product: selectedProduct,
        qty: orderedQty,
        delivered: 0,
        price,
        status: 'Draft'
      };

      const backendObj = {
        id: newOrder.id,
        date: newOrder.date,
        customer: newOrder.customer,
        status: newOrder.status,
        salesperson: newOrder.salesperson,
        items: [{
          product: newOrder.product,
          price: newOrder.price,
          qty: newOrder.qty,
          delivered: newOrder.delivered,
          address: newOrder.address
        }],
        total: newOrder.qty * newOrder.price,
        owner: ''
      };
      syncToBackend('POST', 'sales-orders', backendObj);
      createAuditLog('Created', newOrder.id);
      saveOrders([...salesOrders, newOrder]);
    }

    setActiveView('list');
  };

  // Transitions
  const handleConfirmOrder = () => {
    setOrderStatus('Confirmed');
    if (selectedOrder) {
      const updated = salesOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'Confirmed' };
          
          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            customer: updatedObj.customer,
            status: updatedObj.status,
            salesperson: updatedObj.salesperson,
            items: [{
              product: updatedObj.product,
              price: updatedObj.price,
              qty: updatedObj.qty,
              delivered: updatedObj.delivered,
              address: updatedObj.address
            }],
            total: (updatedObj.status === 'Delivered' || updatedObj.status === 'Partially Delivered' ? updatedObj.delivered : updatedObj.qty) * updatedObj.price,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `sales-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Confirmed', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleDeliverOrder = () => {
    let nextStatus = 'Partially Delivered';
    if (deliveredQty >= orderedQty) {
      nextStatus = 'Delivered';
    }

    setOrderStatus(nextStatus);
    if (selectedOrder) {
      const updated = salesOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: nextStatus, delivered: deliveredQty };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            customer: updatedObj.customer,
            status: updatedObj.status,
            salesperson: updatedObj.salesperson,
            items: [{
              product: updatedObj.product,
              price: updatedObj.price,
              qty: updatedObj.qty,
              delivered: updatedObj.delivered,
              address: updatedObj.address
            }],
            total: (updatedObj.status === 'Delivered' || updatedObj.status === 'Partially Delivered' ? updatedObj.delivered : updatedObj.qty) * updatedObj.price,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `sales-orders/${updatedObj.id}`, backendObj);
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
      const updated = salesOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'Cancelled' };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            customer: updatedObj.customer,
            status: updatedObj.status,
            salesperson: updatedObj.salesperson,
            items: [{
              product: updatedObj.product,
              price: updatedObj.price,
              qty: updatedObj.qty,
              delivered: updatedObj.delivered,
              address: updatedObj.address
            }],
            total: (updatedObj.status === 'Delivered' || updatedObj.status === 'Partially Delivered' ? updatedObj.delivered : updatedObj.qty) * updatedObj.price,
            owner: updatedObj.owner || ''
          };
          syncToBackend('PUT', `sales-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Cancelled', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  // Filter orders by search
  const filteredOrders = salesOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-calculated fields
  const currentPrice = PRODUCT_PRICES[selectedProduct] || 0;
  const isDeliveredState = orderStatus === 'Delivered' || orderStatus === 'Partially Delivered';
  const totalAmount = isDeliveredState ? (deliveredQty * currentPrice) : (orderedQty * currentPrice);
  
  // Stock availability check (assume stock is 10 for each product)
  const isStockWarning = orderedQty > 10;

  return (
    <div className="page-content animated fadeIn">
      
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Sales Orders</h2>
          <p className="sys-desc" style={{ margin: '4px 0 0 0' }}>Manage sales contracts, track order progress and coordinate deliveries</p>
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
            ＋ New Sales Order
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {activeView === 'list' && (
        <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by ID, customer or item..."
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
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Salesperson</th>
                  <th>Product</th>
                  <th>Amount</th>
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
                      <td style={{ fontWeight: '600' }}>{order.customer}</td>
                      <td>{order.salesperson}</td>
                      <td>{order.product}</td>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        ${(order.status === 'Delivered' || order.status === 'Partially Delivered' ? order.delivered : order.qty) * order.price}
                      </td>
                      <td>
                        <span className={`status-pill ${
                          order.status === 'Delivered' ? 'status-active' :
                          order.status === 'Draft' ? 'status-pending-badge' :
                          order.status === 'Cancelled' ? 'status-warning-badge' : 'status-active'
                        }`} style={{ background: order.status === 'Partially Delivered' ? '#fef3c7' : '', color: order.status === 'Partially Delivered' ? '#d97706' : '' }}>
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
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No sales orders found matching your search.
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
          {['Draft', 'Confirmed', 'Partially Delivered', 'Delivered'].map(colStatus => {
            const list = salesOrders.filter(o => o.status === colStatus);
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
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{order.customer}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{order.product}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.02)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {order.qty}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          ${(order.status === 'Delivered' || order.status === 'Partially Delivered' ? order.delivered : order.qty) * order.price}
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
              {selectedOrder ? `Edit Sales Order ${selectedOrder.id}` : 'New Sales Order'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => onNavigate('audit-logs', 'Sales')}
                style={{ marginTop: 0, padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📋 Logs
              </button>
              <span className={`status-pill ${
                orderStatus === 'Delivered' ? 'status-active' :
                orderStatus === 'Draft' ? 'status-pending-badge' :
                orderStatus === 'Cancelled' ? 'status-warning-badge' : 'status-active'
              }`}>
                Status: {orderStatus}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Customer Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Customer Name *</label>
                <input
                  type="text"
                  className="filter-control-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={orderStatus === 'Delivered' || orderStatus === 'Cancelled'}
                  required
                />
              </div>

              {/* Customer Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Customer Address *</label>
                <input
                  type="text"
                  className="filter-control-input"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  disabled={orderStatus === 'Delivered' || orderStatus === 'Cancelled'}
                  required
                />
              </div>

              {/* Sales Person Dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Sales Person</label>
                <select
                  className="filter-control-select"
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  disabled={orderStatus === 'Delivered' || orderStatus === 'Cancelled'}
                >
                  {SALESPERSON_LIST.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Order Date */}
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

              {/* Product Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Product</label>
                <select
                  className="filter-control-select"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  disabled={orderStatus === 'Delivered' || orderStatus === 'Cancelled'}
                >
                  {Object.keys(PRODUCT_PRICES).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Sales Price (Auto Populated) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Sales Price</label>
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
                  disabled={orderStatus === 'Delivered' || orderStatus === 'Cancelled'}
                  min={1}
                />
                {isStockWarning && (
                  <span style={{ fontSize: '11px', color: '#d97706', fontWeight: '600' }}>
                    ⚠️ Warning: Quantity exceeds standard stock level (10)
                  </span>
                )}
              </div>

              {/* Delivered Quantity (only editable in Confirmed/Partially Delivered) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Delivered Quantity</label>
                <input
                  type="number"
                  className="filter-control-input"
                  value={deliveredQty}
                  onChange={(e) => setDeliveredQty(Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={orderStatus === 'Draft' || orderStatus === 'Delivered' || orderStatus === 'Cancelled'}
                  min={0}
                />
              </div>

              {/* Total Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Total Amount ({isDeliveredState ? 'Delivered Qty * Price' : 'Ordered Qty * Price'})
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
                  disabled={orderStatus === 'Delivered' || orderStatus === 'Cancelled'}
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
                    Confirm Order
                  </button>
                )}

                {(orderStatus === 'Confirmed' || orderStatus === 'Partially Delivered') && (
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={handleDeliverOrder}
                    style={{ marginTop: 0, background: '#10b981', color: '#fff' }}
                  >
                    Update Delivery
                  </button>
                )}

                {(orderStatus === 'Draft' || orderStatus === 'Confirmed' || orderStatus === 'Partially Delivered') && (
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={handleCancelOrder}
                    style={{ marginTop: 0, borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setActiveView('list')}
                style={{ marginTop: 0 }}
              >
                Close
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

export default SalesOrders;
