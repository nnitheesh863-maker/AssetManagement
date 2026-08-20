import React, { useState, useEffect } from 'react';

const ASSIGNEE_LIST = ['Amit Sharma', 'Neha Verma', 'Ravi Patel', 'Meera Singh'];

// Pre-seeded components for selection
const COMPONENT_OPTIONS = [
  'Teak Veneer',
  'Raw Lumber',
  'Drawer handles',
  'Wood Glue',
  'Pendant lights',
  'Heavy Duty Wood Screws',
  'Sanding Discs Box',
  'Oak Wood Veneer Rolls'
];

const WORK_CENTER_LIST = [
  'Pre-Production',
  'Assembly Line',
  'Finishing Line',
  'Upholstery Dep'
];

function ManufacturingOrders({ onNavigate }) {
  const [mfgOrders, setMfgOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [activeView, setActiveView] = useState('list'); // 'list' | 'kanban' | 'form'
  const [selectedOrder, setSelectedOrder] = useState(null); // null for new order
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Form Fields State
  const [selectedBomId, setSelectedBomId] = useState('');
  const [finishedProduct, setFinishedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [assignee, setAssignee] = useState(ASSIGNEE_LIST[0]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('Draft');
  
  // Tab details
  const [activeTab, setActiveTab] = useState('components'); // 'components' | 'work-orders'
  const [components, setComponents] = useState([]);
  const [operations, setOperations] = useState([]);

  // Live Timer State for Operations
  const [activeTimerId, setActiveTimerId] = useState(null);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

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
      user: assignee || 'Amit Sharma',
      module: 'Manufacturing',
      type: 'Manufacturing Order',
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

  // Load orders and BOMs on mount
  useEffect(() => {
    const fetchBomsAndOrders = async () => {
      // Load BOMs
      try {
        const bomRes = await fetch(`${API_BASE_URL}/boms`);
        if (bomRes.ok) {
          const bomData = await bomRes.json();
          if (bomData.length > 0) {
            setBoms(bomData);
            localStorage.setItem('assetflow_boms', JSON.stringify(bomData));
          } else {
            const savedBoms = localStorage.getItem('assetflow_boms');
            if (savedBoms) setBoms(JSON.parse(savedBoms));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch BOMs from backend, using localStorage.", err);
        const savedBoms = localStorage.getItem('assetflow_boms');
        if (savedBoms) setBoms(JSON.parse(savedBoms));
      }

      // Load Mfg Orders
      try {
        const orderRes = await fetch(`${API_BASE_URL}/manufacturing-orders`);
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          if (orderData.length > 0) {
            const formatted = orderData.map(r => ({
              id: r.id,
              bomId: r.bom || '',
              product: r.product,
              qty: r.qty,
              unit: r.units || 'Units',
              workCenter: r.workCenter || (r.operations?.[0]?.workCenter || 'Assembly Line'),
              date: r.date,
              owner: r.assignee,
              status: r.status,
              components: r.components,
              workOrders: r.operations
            }));
            setMfgOrders(formatted);
            localStorage.setItem('assetflow_manufacturing_orders', JSON.stringify(formatted));
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Manufacturing Orders from backend, using localStorage.", err);
      }

      const savedOrders = localStorage.getItem('assetflow_manufacturing_orders');
      if (savedOrders) {
        setMfgOrders(JSON.parse(savedOrders));
      } else {
        const initial = [
          {
            id: 'MO-000001',
            bomId: 'BOM-000001',
            product: 'Door Frames',
            qty: 10.0,
            unit: 'Units',
            workCenter: 'Pre-Production',
            date: '2026-08-20',
            owner: 'Amit Sharma',
            status: 'Confirmed',
            components: [
              { id: 1, name: 'Raw Lumber', qty: 15, consumed: 0, unit: 'Units' },
              { id: 2, name: 'Wood Glue', qty: 2, consumed: 0, unit: 'Units' }
            ],
            workOrders: [
              { id: 1, operation: 'Cutting', workCenter: 'Pre-Production', duration: 45, realDuration: 0 },
              { id: 2, operation: 'Assembly', workCenter: 'Assembly Line', duration: 60, realDuration: 0 }
            ]
          },
          {
            id: 'MO-000002',
            bomId: '',
            product: 'Lighting Frame',
            qty: 5.0,
            unit: 'Units',
            workCenter: 'Assembly Line',
            date: '2026-08-19',
            owner: 'Neha Verma',
            status: 'Draft',
            components: [
              { id: 1, name: 'Pendant lights', qty: 5, consumed: 0, unit: 'Units' }
            ],
            workOrders: [
              { id: 1, operation: 'Welding', workCenter: 'Assembly Line', duration: 30, realDuration: 0 }
            ]
          }
        ];
        setMfgOrders(initial);
        localStorage.setItem('assetflow_manufacturing_orders', JSON.stringify(initial));
      }
    };

    fetchBomsAndOrders();
  }, []);

  // Timer clean up
  useEffect(() => {
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [timerIntervalId]);

  const saveOrders = (updatedList) => {
    setMfgOrders(updatedList);
    localStorage.setItem('assetflow_manufacturing_orders', JSON.stringify(updatedList));
  };

  // Helper to check component stock availability (Assume max stock of raw components is 12 units)
  const isComponentAvailable = (comp) => {
    const requiredQty = comp.qty * qty;
    return requiredQty <= 12;
  };

  // Helper to determine total component status of an order
  const getOrderComponentStatus = (order) => {
    if (!order.components || order.components.length === 0) return 'Available';
    const allAvailable = order.components.every(c => {
      const requiredQty = c.qty * (order.qty || 1);
      return requiredQty <= 12;
    });
    return allAvailable ? 'Available' : 'Not Available';
  };

  // Handle BOM selection and auto-populate fields
  const handleBomChange = (bomId) => {
    setSelectedBomId(bomId);
    if (!bomId) return;
    const foundBom = boms.find(b => b.id === bomId);
    if (foundBom) {
      setFinishedProduct(foundBom.product);
      setQty(foundBom.qty);
      
      // Auto populate components with default consumed = 0
      const populatedComps = (foundBom.components || []).map(c => ({
        id: c.id,
        name: c.name,
        qty: c.qty,
        consumed: 0,
        unit: c.unit
      }));
      setComponents(populatedComps);

      // Auto populate operations with default realDuration = 0
      const populatedOps = (foundBom.workOrders || []).map(w => ({
        id: w.id,
        operation: w.operation,
        workCenter: w.workCenter,
        duration: w.duration,
        realDuration: 0
      }));
      setOperations(populatedOps);
    }
  };

  // Open form for editing
  const handleEditOrder = (order) => {
    // If active timer, clear it
    stopTimer();
    setSelectedOrder(order);
    setSelectedBomId(order.bomId || '');
    setFinishedProduct(order.product);
    setQty(order.qty);
    setAssignee(order.owner);
    setScheduledDate(order.date);
    setOrderStatus(order.status);
    setComponents(order.components || []);
    setOperations(order.workOrders || []);
    setActiveTab('components');
    setActiveView('form');
  };

  // Open form for creating new
  const handleNewOrder = () => {
    stopTimer();
    setSelectedOrder(null);
    setSelectedBomId('');
    setFinishedProduct('');
    setQty(1);
    setAssignee(ASSIGNEE_LIST[0]);
    const today = new Date().toISOString().split('T')[0];
    setScheduledDate(today);
    setOrderStatus('Draft');
    setComponents([
      { id: Date.now(), name: COMPONENT_OPTIONS[0], qty: 1, consumed: 0, unit: 'Units' }
    ]);
    setOperations([
      { id: Date.now(), operation: 'Cutting Frame', workCenter: WORK_CENTER_LIST[0], duration: 30, realDuration: 0 }
    ]);
    setActiveTab('components');
    setActiveView('form');
  };

  // Save changes from form
  const handleSaveForm = (e) => {
    if (e) e.preventDefault();
    if (!finishedProduct || !scheduledDate) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    const primaryWorkCenter = operations.length > 0 ? operations[0].workCenter : 'Assembly Line';

    if (selectedOrder) {
      // Edit existing
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = {
            ...o,
            bomId: selectedBomId,
            product: finishedProduct,
            qty,
            owner: assignee,
            date: scheduledDate,
            status: orderStatus,
            workCenter: primaryWorkCenter,
            components,
            workOrders: operations
          };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            product: updatedObj.product,
            bom: updatedObj.bomId,
            qty: updatedObj.qty,
            units: updatedObj.unit,
            assignee: updatedObj.owner,
            status: updatedObj.status,
            components: updatedObj.components,
            operations: updatedObj.workOrders
          };
          syncToBackend('PUT', `manufacturing-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Updated', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    } else {
      // Create new with autogenerated zero-padded sequence
      const nextNum = mfgOrders.length + 1;
      const newId = `MO-${String(nextNum).padStart(6, '0')}`;
      const newOrder = {
        id: newId,
        bomId: selectedBomId,
        product: finishedProduct,
        qty,
        unit: 'Units',
        workCenter: primaryWorkCenter,
        date: scheduledDate,
        owner: assignee,
        status: 'Draft',
        components,
        workOrders: operations
      };

      const backendObj = {
        id: newOrder.id,
        date: newOrder.date,
        product: newOrder.product,
        bom: newOrder.bomId,
        qty: newOrder.qty,
        units: newOrder.unit,
        assignee: newOrder.owner,
        status: newOrder.status,
        components: newOrder.components,
        operations: newOrder.workOrders
      };
      syncToBackend('POST', 'manufacturing-orders', backendObj);
      createAuditLog('Created', newOrder.id);
      saveOrders([...mfgOrders, newOrder]);
    }

    stopTimer();
    setActiveView('list');
  };

  // Workflow transition actions
  const handleConfirmOrder = () => {
    setOrderStatus('Confirmed');
    if (selectedOrder) {
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'Confirmed' };
          
          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            product: updatedObj.product,
            bom: updatedObj.bomId,
            qty: updatedObj.qty,
            units: updatedObj.unit,
            assignee: updatedObj.owner,
            status: updatedObj.status,
            components: updatedObj.components,
            operations: updatedObj.workOrders
          };
          syncToBackend('PUT', `manufacturing-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Confirmed', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleStartProduction = () => {
    setOrderStatus('In Progress');
    if (selectedOrder) {
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'In Progress' };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            product: updatedObj.product,
            bom: updatedObj.bomId,
            qty: updatedObj.qty,
            units: updatedObj.unit,
            assignee: updatedObj.owner,
            status: updatedObj.status,
            components: updatedObj.components,
            operations: updatedObj.workOrders
          };
          syncToBackend('PUT', `manufacturing-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Started Production', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleMarkAsDone = () => {
    setOrderStatus('Done');
    stopTimer();
    if (selectedOrder) {
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'Done' };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            product: updatedObj.product,
            bom: updatedObj.bomId,
            qty: updatedObj.qty,
            units: updatedObj.unit,
            assignee: updatedObj.owner,
            status: updatedObj.status,
            components: updatedObj.components,
            operations: updatedObj.workOrders
          };
          syncToBackend('PUT', `manufacturing-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Marked as Done', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleCancelOrder = () => {
    setOrderStatus('Cancelled');
    stopTimer();
    if (selectedOrder) {
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          const updatedObj = { ...o, status: 'Cancelled' };

          const backendObj = {
            id: updatedObj.id,
            date: updatedObj.date,
            product: updatedObj.product,
            bom: updatedObj.bomId,
            qty: updatedObj.qty,
            units: updatedObj.unit,
            assignee: updatedObj.owner,
            status: updatedObj.status,
            components: updatedObj.components,
            operations: updatedObj.workOrders
          };
          syncToBackend('PUT', `manufacturing-orders/${updatedObj.id}`, backendObj);
          createAuditLog('Cancelled', updatedObj.id);
          return updatedObj;
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  // Live Timer Operations
  const toggleOperationTimer = (opId) => {
    if (activeTimerId === opId) {
      // Pause
      stopTimer();
    } else {
      // Start/Resume
      stopTimer();
      setActiveTimerId(opId);
      const interval = setInterval(() => {
        setOperations(prevOps => prevOps.map(op => {
          if (op.id === opId) {
            return { ...op, realDuration: (op.realDuration || 0) + 1 };
          }
          return op;
        }));
      }, 1000);
      setTimerIntervalId(interval);
    }
  };

  const stopTimer = () => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
    setActiveTimerId(null);
  };

  const formatRealDuration = (seconds) => {
    const secs = seconds || 0;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  // Components table line handling
  const handleAddComponentLine = () => {
    const newLine = {
      id: Date.now(),
      name: COMPONENT_OPTIONS[0],
      qty: 1,
      consumed: 0,
      unit: 'Units'
    };
    setComponents([...components, newLine]);
  };

  const handleUpdateComponentLine = (id, field, value) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleRemoveComponentLine = (id) => {
    setComponents(components.filter(c => c.id !== id));
  };

  // Operations table line handling
  const handleAddOperationLine = () => {
    const newLine = {
      id: Date.now(),
      operation: 'New Routing Step',
      workCenter: WORK_CENTER_LIST[0],
      duration: 30,
      realDuration: 0
    };
    setOperations([...operations, newLine]);
  };

  const handleUpdateOperationLine = (id, field, value) => {
    setOperations(operations.map(op => op.id === id ? { ...op, [field]: value } : op));
  };

  const handleRemoveOperationLine = (id) => {
    if (activeTimerId === id) stopTimer();
    setOperations(operations.filter(op => op.id !== id));
  };

  // Checkbox Selection in List
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filter orders by search
  const filteredOrders = mfgOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.workCenter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content animated fadeIn">
      
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Manufacturing Orders</h2>
          <p className="sys-desc" style={{ margin: '4px 0 0 0' }}>Plan, schedule, and track workshop assembly routing operations</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`btn ${activeView === 'list' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => { stopTimer(); setActiveView('list'); }}
            style={{ marginTop: 0 }}
          >
            List View
          </button>
          <button 
            className={`btn ${activeView === 'kanban' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => { stopTimer(); setActiveView('kanban'); }}
            style={{ marginTop: 0 }}
          >
            Kanban Board
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNewOrder}
            style={{ marginTop: 0, background: '#2563eb', borderColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            New Manufacturing Order
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {activeView === 'list' && (
        <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search Reference, product or work center..."
                className="filter-control-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '360px', paddingLeft: '32px' }}
              />
              <span style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }}>🔍</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                Showing {filteredOrders.length} orders
              </span>
            </div>
          </div>

          <div className="table-container-scroll">
            <table className="erp-dashboard-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    />
                  </th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Finished Product</th>
                  <th>Component Status</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => {
                    const compStatus = getOrderComponentStatus(order);
                    return (
                      <tr key={order.id}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(order.id)}
                            onChange={() => handleSelectRow(order.id)}
                          />
                        </td>
                        <td className="order-id-cell" style={{ fontWeight: '700' }}>{order.id}</td>
                        <td>{order.date}</td>
                        <td style={{ fontWeight: '600' }}>{order.product}</td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: compStatus === 'Available' ? '#d1fae5' : '#fee2e2',
                            color: compStatus === 'Available' ? '#065f46' : '#991b1b'
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: compStatus === 'Available' ? '#10b981' : '#ef4444'
                            }}></span>
                            {compStatus}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>{parseFloat(order.qty).toFixed(2)}</td>
                        <td><span className="badge category-badge">{order.unit}</span></td>
                        <td>
                          <span className={`status-pill ${
                            order.status === 'Done' ? 'status-active' :
                            order.status === 'Draft' ? 'status-pending-badge' :
                            order.status === 'Cancelled' ? 'status-warning-badge' : 'status-active'
                          }`} style={{ background: order.status === 'In Progress' ? '#dbeafe' : '', color: order.status === 'In Progress' ? '#1e40af' : '' }}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-outline btn-small-table" onClick={() => handleEditOrder(order)}>
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No manufacturing orders found matching your search.
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'flex-start' }}>
          {['Draft', 'Confirmed', 'In Progress', 'Done'].map(colStatus => {
            const list = mfgOrders.filter(o => o.status === colStatus);
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
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{order.product}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.workCenter}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.02)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Qty: {order.qty}</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>{order.owner}</span>
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
          
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => { stopTimer(); setActiveView('list'); }}
                style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              
              {orderStatus === 'Draft' && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleConfirmOrder}
                  style={{ marginTop: 0, borderColor: 'var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm
                </button>
              )}

              {orderStatus === 'Confirmed' && (
                <button 
                  type="button" 
                  className="btn" 
                  onClick={handleStartProduction}
                  style={{ marginTop: 0, background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start
                </button>
              )}

              {orderStatus === 'In Progress' && (
                <button 
                  type="button" 
                  className="btn" 
                  onClick={handleMarkAsDone}
                  style={{ marginTop: 0, background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Produce / Done
                </button>
              )}

              {(orderStatus === 'Draft' || orderStatus === 'Confirmed' || orderStatus === 'In Progress') && (
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleCancelOrder}
                  style={{ marginTop: 0, borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cancel
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="status-pill status-active" style={{ fontSize: '13px', fontWeight: '800', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px' }}>
                {selectedOrder ? selectedOrder.id : 'MO-XXXXXX (New)'}
              </span>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => onNavigate('audit-logs', 'Manufacturing')}
                style={{ marginTop: 0, padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Logs
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* BOM Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Select BOM Template</label>
                <select
                  className="filter-control-select"
                  value={selectedBomId}
                  onChange={(e) => handleBomChange(e.target.value)}
                  disabled={orderStatus !== 'Draft'}
                >
                  <option value="">-- No BOM Template --</option>
                  {boms.map(b => (
                    <option key={b.id} value={b.id}>{b.id} ({b.product} - Ref: {b.reference})</option>
                  ))}
                </select>
              </div>

              {/* Finished Product */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Finished Product *</label>
                <input
                  type="text"
                  className="filter-control-input"
                  value={finishedProduct}
                  onChange={(e) => setFinishedProduct(e.target.value)}
                  disabled={orderStatus !== 'Draft'}
                  placeholder="Finished Product Name"
                  required
                />
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Quantity to Produce *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    className="filter-control-input"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={orderStatus !== 'Draft'}
                    min={1}
                    style={{ flex: 1 }}
                    required
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Units</span>
                </div>
              </div>

              {/* Scheduled Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Scheduled Date *</label>
                <input
                  type="date"
                  className="filter-control-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  disabled={orderStatus === 'Done' || orderStatus === 'Cancelled'}
                  required
                />
              </div>

              {/* Supervisor / Assignee */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Assignee / Supervisor</label>
                <select
                  className="filter-control-select"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  disabled={orderStatus === 'Done' || orderStatus === 'Cancelled'}
                >
                  {ASSIGNEE_LIST.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Tab Selector Bar */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--card-border)', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('components')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'components' ? '3px solid var(--primary)' : 'none',
                  fontWeight: '700',
                  color: activeTab === 'components' ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Components
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('work-orders')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'work-orders' ? '3px solid var(--primary)' : 'none',
                  fontWeight: '700',
                  color: activeTab === 'work-orders' ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Work Orders
              </button>
            </div>

            {/* Tab Contents: Components */}
            {activeTab === 'components' && (
              <div style={{ textAlign: 'left' }}>
                <table className="erp-dashboard-table" style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th style={{ width: '130px' }}>Availability</th>
                      <th style={{ width: '120px' }}>To Consume</th>
                      <th style={{ width: '120px' }}>Consumed</th>
                      <th style={{ width: '100px' }}>Units</th>
                      {orderStatus === 'Draft' && <th style={{ width: '60px' }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((line, idx) => {
                      const available = isComponentAvailable(line);
                      return (
                        <tr key={line.id}>
                          <td>
                            {orderStatus === 'Draft' ? (
                              <select
                                className="filter-control-select"
                                value={line.name}
                                onChange={(e) => handleUpdateComponentLine(line.id, 'name', e.target.value)}
                                style={{ width: '100%' }}
                              >
                                {COMPONENT_OPTIONS.map(cName => (
                                  <option key={cName} value={cName}>{cName}</option>
                                ))}
                              </select>
                            ) : (
                              <span>{line.name}</span>
                            )}
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: available ? '#e6fffa' : '#fef2f2',
                              color: available ? '#047857' : '#b91c1c'
                            }}>
                              <span style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: available ? '#059669' : '#dc2626'
                              }}></span>
                              {available ? 'Available' : 'Not Available'}
                            </span>
                          </td>
                          <td>
                            {orderStatus === 'Draft' ? (
                              <input
                                type="number"
                                className="filter-control-input"
                                value={line.qty}
                                onChange={(e) => handleUpdateComponentLine(line.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                                min={1}
                              />
                            ) : (
                              <span>{line.qty * qty}</span>
                            )}
                          </td>
                          <td>
                            <input
                              type="number"
                              className="filter-control-input"
                              value={line.consumed || 0}
                              onChange={(e) => handleUpdateComponentLine(line.id, 'consumed', Math.max(0, parseInt(e.target.value) || 0))}
                              disabled={orderStatus === 'Done' || orderStatus === 'Cancelled'}
                              min={0}
                            />
                          </td>
                          <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{line.unit}</td>
                          {orderStatus === 'Draft' && (
                            <td>
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => handleRemoveComponentLine(line.id)}
                                style={{ padding: '6px 10px', borderColor: '#ef4444', color: '#ef4444' }}
                              >
                                🗑️
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {components.length === 0 && (
                      <tr>
                        <td colSpan={orderStatus === 'Draft' ? 6 : 5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
                          No components configured. Select a BOM template to load components.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {orderStatus === 'Draft' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleAddComponentLine}
                    style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    ＋ Add a product
                  </button>
                )}
              </div>
            )}

            {/* Tab Contents: Work Orders */}
            {activeTab === 'work-orders' && (
              <div style={{ textAlign: 'left' }}>
                <table className="erp-dashboard-table" style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Operations</th>
                      <th>Work Center</th>
                      <th style={{ width: '130px' }}>Duration (min)</th>
                      <th style={{ width: '130px' }}>Real Duration</th>
                      <th style={{ width: '100px' }}>Actions</th>
                      {orderStatus === 'Draft' && <th style={{ width: '60px' }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((line, idx) => (
                      <tr key={line.id}>
                        <td>
                          {orderStatus === 'Draft' ? (
                            <input
                              type="text"
                              className="filter-control-input"
                              value={line.operation}
                              onChange={(e) => handleUpdateOperationLine(line.id, 'operation', e.target.value)}
                              placeholder="Operation details"
                            />
                          ) : (
                            <span>{line.operation}</span>
                          )}
                        </td>
                        <td>
                          {orderStatus === 'Draft' ? (
                            <select
                              className="filter-control-select"
                              value={line.workCenter}
                              onChange={(e) => handleUpdateOperationLine(line.id, 'workCenter', e.target.value)}
                              style={{ width: '100%' }}
                            >
                              {WORK_CENTER_LIST.map(wc => (
                                <option key={wc} value={wc}>{wc}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge category-badge">{line.workCenter}</span>
                          )}
                        </td>
                        <td>
                          {orderStatus === 'Draft' ? (
                            <input
                              type="number"
                              className="filter-control-input"
                              value={line.duration}
                              onChange={(e) => handleUpdateOperationLine(line.id, 'duration', Math.max(1, parseInt(e.target.value) || 1))}
                              min={1}
                            />
                          ) : (
                            <span>{line.duration} min</span>
                          )}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: activeTimerId === line.id ? '#2563eb' : 'var(--text-primary)' }}>
                          {activeTimerId === line.id ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <span className="spin-icon">⏳</span>
                              {formatRealDuration(line.realDuration)}
                            </span>
                          ) : (
                            <span>{formatRealDuration(line.realDuration)}</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => toggleOperationTimer(line.id)}
                            disabled={orderStatus !== 'In Progress'}
                            style={{ 
                              padding: '4px 10px', 
                              fontSize: '11px',
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              borderColor: activeTimerId === line.id ? '#f59e0b' : 'var(--primary)',
                              color: activeTimerId === line.id ? '#d97706' : 'var(--primary)'
                            }}
                          >
                            {activeTimerId === line.id ? (
                              <>
                                <svg style={{ width: '12px', height: '12px' }} fill="currentColor" viewBox="0 0 24 24">
                                  <rect x="6" y="4" width="4" height="16" />
                                  <rect x="14" y="4" width="4" height="16" />
                                </svg>
                                Pause
                              </>
                            ) : (
                              <>
                                <svg style={{ width: '12px', height: '12px' }} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                Start
                              </>
                            )}
                          </button>
                        </td>
                        {orderStatus === 'Draft' && (
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => handleRemoveOperationLine(line.id)}
                              style={{ padding: '6px 10px', borderColor: '#ef4444', color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {operations.length === 0 && (
                      <tr>
                        <td colSpan={orderStatus === 'Draft' ? 6 : 5} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
                          No operations configured. Select a BOM template to load operations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {orderStatus === 'Draft' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleAddOperationLine}
                    style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    ＋ Add a line
                  </button>
                )}
              </div>
            )}

            {/* Save Buttons Panel */}
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => { stopTimer(); setActiveView('list'); }}
                style={{ marginTop: 0 }}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleSaveForm}
                disabled={orderStatus === 'Done' || orderStatus === 'Cancelled'}
                style={{ marginTop: 0, width: 'auto', padding: '0 24px' }}
              >
                Save
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

export default ManufacturingOrders;
