import React, { useState, useEffect } from 'react';

const SUPERVISOR_LIST = ['Amit Sharma', 'Neha Verma', 'Ravi Patel', 'Meera Singh'];

function ManufacturingOrders({ onNavigate }) {
  const [mfgOrders, setMfgOrders] = useState([]);
  const [boms, setBoms] = useState([]);
  const [activeView, setActiveView] = useState('list'); // 'list' | 'kanban' | 'form'
  const [selectedOrder, setSelectedOrder] = useState(null); // null for new order
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields State
  const [selectedBomId, setSelectedBomId] = useState('');
  const [finishedProduct, setFinishedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [supervisor, setSupervisor] = useState(SUPERVISOR_LIST[0]);
  const [scheduledDate, setScheduledDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('Draft');
  
  // Tab details for components and operations populated from BOM
  const [activeTab, setActiveTab] = useState('components'); // 'components' | 'operations'
  const [components, setComponents] = useState([]);
  const [operations, setOperations] = useState([]);

  // Load orders and BOMs on mount
  useEffect(() => {
    // Load BOMs
    const savedBoms = localStorage.getItem('assetflow_boms');
    if (savedBoms) {
      setBoms(JSON.parse(savedBoms));
    } else {
      // Default fallback BOMs if not set
      const defaultBoms = [
        {
          id: 'BOM-000001',
          reference: 'DF-01',
          product: 'Door Frames',
          qty: 10.0,
          unit: 'Units',
          components: [
            { id: 1, name: 'Raw Lumber', qty: 15, unit: 'Units' },
            { id: 2, name: 'Wood Glue', qty: 2, unit: 'Units' }
          ],
          workOrders: [
            { id: 1, operation: 'Cutting', workCenter: 'Pre-Production', duration: 45 },
            { id: 2, operation: 'Assembly', workCenter: 'Assembly Line', duration: 60 }
          ]
        }
      ];
      setBoms(defaultBoms);
    }

    // Load Mfg Orders
    const savedOrders = localStorage.getItem('assetflow_manufacturing_orders');
    if (savedOrders) {
      setMfgOrders(JSON.parse(savedOrders));
    } else {
      // Map initial mock data to our structural format
      const initial = [
        {
          id: 'MO-001',
          bomId: 'BOM-000001',
          product: 'Cushion Padding - Sofa Sets',
          qty: 5,
          unit: 'Units',
          workCenter: 'Upholstery Dep',
          date: '2026-08-19',
          owner: 'Mahesh Gupta',
          status: 'Confirmed',
          components: [
            { id: 1, name: 'Raw Lumber', qty: 8, unit: 'Units' }
          ],
          workOrders: [
            { id: 1, operation: 'Upholstery Cover Stapling', workCenter: 'Upholstery Dep', duration: 15 }
          ]
        },
        {
          id: 'MO-002',
          bomId: '',
          product: 'Armchair Frame Welding',
          qty: 8,
          unit: 'Units',
          workCenter: 'Assembly Line',
          date: '2026-08-19',
          owner: 'Mahesh Gupta',
          status: 'Confirmed',
          components: [],
          workOrders: []
        },
        {
          id: 'MO-008',
          bomId: '',
          product: 'Board Cutting - Wardrobes',
          qty: 20,
          unit: 'Units',
          workCenter: 'Pre-Production',
          date: '2026-08-17',
          owner: 'Mahesh Gupta',
          status: 'Draft',
          components: [],
          workOrders: []
        }
      ];
      setMfgOrders(initial);
      localStorage.setItem('assetflow_manufacturing_orders', JSON.stringify(initial));
    }
  }, []);

  const saveOrders = (updatedList) => {
    setMfgOrders(updatedList);
    localStorage.setItem('assetflow_manufacturing_orders', JSON.stringify(updatedList));
  };

  // Handle BOM selection and auto-populate fields
  const handleBomChange = (bomId) => {
    setSelectedBomId(bomId);
    if (!bomId) {
      return;
    }
    const foundBom = boms.find(b => b.id === bomId);
    if (foundBom) {
      setFinishedProduct(foundBom.product);
      setQty(foundBom.qty);
      setComponents(foundBom.components || []);
      // Map workOrders to operations
      setOperations(foundBom.workOrders || []);
    }
  };

  // Open form for editing
  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setSelectedBomId(order.bomId || '');
    setFinishedProduct(order.product);
    setQty(order.qty);
    setSupervisor(order.owner);
    setScheduledDate(order.date);
    setOrderStatus(order.status);
    setComponents(order.components || []);
    setOperations(order.workOrders || []);
    setActiveTab('components');
    setActiveView('form');
  };

  // Open form for creating new
  const handleNewOrder = () => {
    setSelectedOrder(null);
    setSelectedBomId('');
    setFinishedProduct('');
    setQty(1);
    setSupervisor(SUPERVISOR_LIST[0]);
    const today = new Date().toISOString().split('T')[0];
    setScheduledDate(today);
    setOrderStatus('Draft');
    setComponents([]);
    setOperations([]);
    setActiveTab('components');
    setActiveView('form');
  };

  // Save changes from form
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!finishedProduct || !scheduledDate) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    // Determine primary work center from operations or default
    const workCenter = operations.length > 0 ? operations[0].workCenter : 'Assembly Line';

    if (selectedOrder) {
      // Edit existing
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            bomId: selectedBomId,
            product: finishedProduct,
            qty,
            owner: supervisor,
            date: scheduledDate,
            status: orderStatus,
            workCenter,
            components,
            workOrders: operations
          };
        }
        return o;
      });
      saveOrders(updated);
    } else {
      // Create new
      const newId = `MO-${String(mfgOrders.length + 1).padStart(3, '0')}`;
      const newOrder = {
        id: newId,
        bomId: selectedBomId,
        product: finishedProduct,
        qty,
        unit: 'Units',
        workCenter,
        date: scheduledDate,
        owner: supervisor,
        status: 'Draft',
        components,
        workOrders: operations
      };
      saveOrders([...mfgOrders, newOrder]);
    }

    setActiveView('list');
  };

  // Workflow transition actions
  const handleConfirmOrder = () => {
    setOrderStatus('Confirmed');
    if (selectedOrder) {
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          return { ...o, status: 'Confirmed' };
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
          return { ...o, status: 'In Progress' };
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleMarkAsDone = () => {
    setOrderStatus('Done');
    if (selectedOrder) {
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          return { ...o, status: 'Done' };
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  const handleCancelOrder = () => {
    setOrderStatus('Cancelled');
    if (selectedOrder) {
      const updated = mfgOrders.map(o => {
        if (o.id === selectedOrder.id) {
          return { ...o, status: 'Cancelled' };
        }
        return o;
      });
      saveOrders(updated);
    }
  };

  // Dynamic add/remove components in form
  const handleAddComponent = () => {
    setComponents([...components, { id: Date.now(), name: 'Raw Lumber', qty: 1, unit: 'Units' }]);
  };

  const handleRemoveComponent = (id) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleAddOperation = () => {
    setOperations([...operations, { id: Date.now(), operation: 'New Operation', workCenter: 'Assembly Line', duration: 30 }]);
  };

  const handleRemoveOperation = (id) => {
    setOperations(operations.filter(op => op.id !== id));
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
            ＋ New Manufacturing Order
          </button>
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {activeView === 'list' && (
        <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by ID, product or work center..."
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
                  <th>Scheduled Date</th>
                  <th>Finished Product</th>
                  <th>Work Center</th>
                  <th>Batch Qty</th>
                  <th>Supervisor</th>
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
                      <td style={{ fontWeight: '600' }}>{order.product}</td>
                      <td><span className="badge category-badge">{order.workCenter}</span></td>
                      <td>{order.qty}</td>
                      <td>{order.owner}</td>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
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
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{order.workCenter}</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {selectedOrder ? `Edit Manufacturing Order ${selectedOrder.id}` : 'New Manufacturing Order'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => onNavigate('audit-logs', 'Manufacturing')}
                style={{ marginTop: 0, padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📋 Logs
              </button>
              <span className={`status-pill ${
                orderStatus === 'Done' ? 'status-active' :
                orderStatus === 'Draft' ? 'status-pending-badge' :
                orderStatus === 'Cancelled' ? 'status-warning-badge' : 'status-active'
              }`}>
                Status: {orderStatus}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* BOM Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Select BOM Template (Auto-populates fields)</label>
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
                <input
                  type="number"
                  className="filter-control-input"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={orderStatus !== 'Draft'}
                  min={1}
                  required
                />
              </div>

              {/* Supervisor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Supervisor</label>
                <select
                  className="filter-control-select"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  disabled={orderStatus === 'Done' || orderStatus === 'Cancelled'}
                >
                  {SUPERVISOR_LIST.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Scheduled Date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', gridColumn: 'span 2' }}>
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
                Components to Consume
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('operations')}
                style={{
                  padding: '12px 24px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'operations' ? '3px solid var(--primary)' : 'none',
                  fontWeight: '700',
                  color: activeTab === 'operations' ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                Work Orders / Operations
              </button>
            </div>

            {/* Tab Contents: Components */}
            {activeTab === 'components' && (
              <div style={{ textAlign: 'left' }}>
                <table className="erp-dashboard-table" style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th style={{ width: '180px' }}>To Consume</th>
                      <th style={{ width: '120px' }}>Units</th>
                      {orderStatus === 'Draft' && <th style={{ width: '60px' }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((line, idx) => (
                      <tr key={line.id}>
                        <td>{line.name}</td>
                        <td>{line.qty * qty}</td>
                        <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{line.unit}</td>
                        {orderStatus === 'Draft' && (
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => handleRemoveComponent(line.id)}
                              style={{ padding: '6px 10px', borderColor: '#ef4444', color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {components.length === 0 && (
                      <tr>
                        <td colSpan={orderStatus === 'Draft' ? 4 : 3} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
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
                    onClick={handleAddComponent}
                    style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    ＋ Add raw component
                  </button>
                )}
              </div>
            )}

            {/* Tab Contents: Operations */}
            {activeTab === 'operations' && (
              <div style={{ textAlign: 'left' }}>
                <table className="erp-dashboard-table" style={{ marginTop: '10px' }}>
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Work Center</th>
                      <th style={{ width: '180px' }}>Expected Duration (min)</th>
                      {orderStatus === 'Draft' && <th style={{ width: '60px' }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((line, idx) => (
                      <tr key={line.id}>
                        <td>{line.operation}</td>
                        <td><span className="badge category-badge">{line.workCenter}</span></td>
                        <td>{line.duration}</td>
                        {orderStatus === 'Draft' && (
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline"
                              onClick={() => handleRemoveOperation(line.id)}
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
                        <td colSpan={orderStatus === 'Draft' ? 4 : 3} style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
                          No operations configured. Select a BOM template to load operations routing.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {orderStatus === 'Draft' && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleAddOperation}
                    style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                  >
                    ＋ Add operation line
                  </button>
                )}
              </div>
            )}

            {/* BUTTON BAR */}
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={orderStatus === 'Done' || orderStatus === 'Cancelled'}
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

                {orderStatus === 'Confirmed' && (
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={handleStartProduction}
                    style={{ marginTop: 0, background: '#2563eb', color: '#fff' }}
                  >
                    Start Production
                  </button>
                )}

                {orderStatus === 'In Progress' && (
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={handleMarkAsDone}
                    style={{ marginTop: 0, background: '#10b981', color: '#fff' }}
                  >
                    Mark as Done
                  </button>
                )}

                {(orderStatus === 'Draft' || orderStatus === 'Confirmed' || orderStatus === 'In Progress') && (
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

export default ManufacturingOrders;
