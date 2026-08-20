import React, { useState, useEffect } from 'react';

// Pre-seeded products list for BOM finished products
const PRODUCT_LIST = [
  'Deluxe Oak Dining Table',
  'Ash Wood Chair Pack',
  'Beech Wood Bedframe',
  'Cedar Garden Table',
  'Cherry Wood Bookshelf',
  'Birch Coffee Table',
  'Walnut Sideboard',
  'Door Frames',
  'Lighting Frame'
];

// Pre-seeded raw materials list for BOM components
const COMPONENT_LIST = [
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

function BOM({ onNavigate }) {
  const [boms, setBoms] = useState([]);
  const [activeView, setActiveView] = useState('list'); // 'list' | 'form'
  const [selectedBom, setSelectedBom] = useState(null); // null for new
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [productList, setProductList] = useState(PRODUCT_LIST);

  // Form Fields State
  const [finishedProduct, setFinishedProduct] = useState(PRODUCT_LIST[0]);
  const [quantity, setQuantity] = useState(1.0);
  const [reference, setReference] = useState('');
  const [activeTab, setActiveTab] = useState('components'); // 'components' | 'work-orders'
  
  // Tab lines state
  const [components, setComponents] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const API_BASE_URL = 'http://localhost:5000/api';

  const syncToBackend = (method, endpoint, bodyObj) => {
    fetch(`${API_BASE_URL}/${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj)
    }).catch(err => console.warn(`Failed to sync ${method} ${endpoint} to backend:`, err));
  };

  const createAuditLog = (action, bomId) => {
    const today = new Date();
    const formattedDate = today.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    const logObj = {
      datetime: formattedDate,
      user: 'Amit Sharma', // default supervisor/user
      module: 'BOM',
      type: 'Bill of Materials',
      id: bomId,
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

  // Initial load
  useEffect(() => {
    const fetchProductsAndBoms = async () => {
      // Load products
      try {
        const prodRes = await fetch(`${API_BASE_URL}/products`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.length > 0) {
            setProductList(prodData.map(p => p.name));
          } else {
            const savedProducts = localStorage.getItem('assetflow_products');
            if (savedProducts) {
              const parsed = JSON.parse(savedProducts);
              if (parsed.length > 0) setProductList(parsed.map(p => p.name));
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch products for BOM list, using localStorage.", err);
        const savedProducts = localStorage.getItem('assetflow_products');
        if (savedProducts) {
          const parsed = JSON.parse(savedProducts);
          if (parsed.length > 0) setProductList(parsed.map(p => p.name));
        }
      }

      // Load BOMs
      try {
        const bomRes = await fetch(`${API_BASE_URL}/boms`);
        if (bomRes.ok) {
          const bomData = await bomRes.json();
          if (bomData.length > 0) {
            setBoms(bomData);
            localStorage.setItem('assetflow_boms', JSON.stringify(bomData));
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch BOMs from backend, using localStorage.", err);
      }

      const saved = localStorage.getItem('assetflow_boms');
      if (saved) {
        setBoms(JSON.parse(saved));
      } else {
      const initial = [
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
        },
        {
          id: 'BOM-000002',
          reference: 'LF-02',
          product: 'Lighting Frame',
          qty: 5.0,
          unit: 'Units',
          components: [
            { id: 1, name: 'Pendant lights', qty: 5, unit: 'Units' },
            { id: 2, name: 'Drawer handles', qty: 10, unit: 'Units' }
          ],
          workOrders: [
            { id: 1, operation: 'Welding', workCenter: 'Assembly Line', duration: 30 },
            { id: 2, operation: 'Finishing', workCenter: 'Finishing Line', duration: 20 }
          ]
        }
      ];
      setBoms(initial);
      localStorage.setItem('assetflow_boms', JSON.stringify(initial));
    }
  };

  fetchProductsAndBoms();
}, []);

  const saveBoms = (updatedList) => {
    setBoms(updatedList);
    localStorage.setItem('assetflow_boms', JSON.stringify(updatedList));
  };

  // Open Form for Editing
  const handleEditBOM = (bom) => {
    setSelectedBom(bom);
    setFinishedProduct(bom.product);
    setQuantity(bom.qty);
    setReference(bom.reference);
    setComponents(bom.components || []);
    setWorkOrders(bom.workOrders || []);
    setActiveTab('components');
    setActiveView('form');
  };

  // Open Form for Creating New
  const handleNewBOM = () => {
    setSelectedBom(null);
    setFinishedProduct(PRODUCT_LIST[0]);
    setQuantity(1.0);
    setReference('');
    // Create standard template components and operations
    setComponents([
      { id: 1, name: COMPONENT_LIST[0], qty: 1, unit: 'Units' }
    ]);
    setWorkOrders([
      { id: 1, operation: 'Initial Cut', workCenter: WORK_CENTER_LIST[0], duration: 30 }
    ]);
    setActiveTab('components');
    setActiveView('form');
  };

  // Save BOM Form
  const handleSaveBOM = (e) => {
    e.preventDefault();
    if (!reference) {
      alert('Please fill out the reference code.');
      return;
    }
    if (reference.length > 8) {
      alert('Reference code cannot exceed 8 characters.');
      return;
    }

    if (selectedBom) {
      // Edit
      const updated = boms.map(b => {
        if (b.id === selectedBom.id) {
          const updatedObj = {
            ...b,
            product: finishedProduct,
            qty: quantity,
            reference,
            components,
            workOrders
          };

          const backendObj = {
            id: updatedObj.id,
            reference: updatedObj.reference,
            product: updatedObj.product,
            qty: updatedObj.qty,
            unit: updatedObj.unit,
            components: updatedObj.components,
            work_orders: updatedObj.workOrders
          };
          syncToBackend('PUT', `boms/${updatedObj.id}`, backendObj);
          createAuditLog('Updated', updatedObj.id);
          return updatedObj;
        }
        return b;
      });
      saveBoms(updated);
    } else {
      // Create new
      const nextNum = boms.length + 1;
      const newId = `BOM-${String(nextNum).padStart(6, '0')}`;
      const newBom = {
        id: newId,
        reference,
        product: finishedProduct,
        qty: quantity,
        unit: 'Units',
        components,
        workOrders
      };

      const backendObj = {
        id: newBom.id,
        reference: newBom.reference,
        product: newBom.product,
        qty: newBom.qty,
        unit: newBom.unit,
        components: newBom.components,
        work_orders: newBom.workOrders
      };
      syncToBackend('POST', 'boms', backendObj);
      createAuditLog('Created', newBom.id);
      saveBoms([...boms, newBom]);
    }
    setActiveView('list');
  };

  // Components table line handling
  const handleAddComponentLine = () => {
    const newLine = {
      id: Date.now(),
      name: COMPONENT_LIST[0],
      qty: 1,
      unit: 'Units'
    };
    setComponents([...components, newLine]);
  };

  const handleUpdateComponentLine = (id, field, value) => {
    const updated = components.map(line => {
      if (line.id === id) {
        return { ...line, [field]: value };
      }
      return line;
    });
    setComponents(updated);
  };

  const handleRemoveComponentLine = (id) => {
    setComponents(components.filter(line => line.id !== id));
  };

  // Work Orders table line handling
  const handleAddWorkOrderLine = () => {
    const newLine = {
      id: Date.now(),
      operation: 'New Operation',
      workCenter: WORK_CENTER_LIST[0],
      duration: 15
    };
    setWorkOrders([...workOrders, newLine]);
  };

  const handleUpdateWorkOrderLine = (id, field, value) => {
    const updated = workOrders.map(line => {
      if (line.id === id) {
        return { ...line, [field]: value };
      }
      return line;
    });
    setWorkOrders(updated);
  };

  const handleRemoveWorkOrderLine = (id) => {
    setWorkOrders(workOrders.filter(line => line.id !== id));
  };

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredBoms.map(b => b.id));
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

  // Search filter
  const filteredBoms = boms.filter(b => 
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content animated fadeIn">
      
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Bills of Materials</h2>
          <p className="sys-desc" style={{ margin: '4px 0 0 0' }}>Define assembly steps, raw material components, and routing work centers</p>
        </div>
        
        {activeView === 'list' && (
          <button 
            className="btn btn-primary" 
            onClick={handleNewBOM}
            style={{ marginTop: 0, background: '#2563eb', borderColor: '#2563eb' }}
          >
            ＋ New Bill of Materials
          </button>
        )}
      </div>

      {/* 1. LIST VIEW */}
      {activeView === 'list' && (
        <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by ID, finished product or reference..."
                className="filter-control-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '360px', paddingLeft: '32px' }}
              />
              <span style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }}>🔍</span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {filteredBoms.length} templates
            </span>
          </div>

          <div className="table-container-scroll">
            <table className="erp-dashboard-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={filteredBoms.length > 0 && selectedIds.length === filteredBoms.length}
                    />
                  </th>
                  <th>Reference</th>
                  <th>Finished Product</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoms.length > 0 ? (
                  filteredBoms.map(bom => (
                    <tr key={bom.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(bom.id)}
                          onChange={() => handleSelectRow(bom.id)}
                        />
                      </td>
                      <td className="order-id-cell" style={{ fontWeight: '700' }}>{bom.id} ({bom.reference})</td>
                      <td style={{ fontWeight: '600' }}>{bom.product}</td>
                      <td>{parseFloat(bom.qty).toFixed(2)}</td>
                      <td><span className="badge category-badge">{bom.unit}</span></td>
                      <td>
                        <button className="btn btn-outline btn-small-table" onClick={() => handleEditBOM(bom)}>
                          Edit / Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No Bill of Materials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. FORM VIEW */}
      {activeView === 'form' && (
        <div className="card glass" style={{ padding: '36px', boxSizing: 'border-box' }}>
          
          {/* Form Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setActiveView('list')}
                style={{ marginTop: 0 }}
              >
                Back
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleSaveBOM}
                style={{ marginTop: 0 }}
              >
                Save
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="status-pill status-active" style={{ fontSize: '13px', fontWeight: '800', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px' }}>
                {selectedBom ? selectedBom.id : 'New BOM'}
              </span>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => onNavigate('audit-logs', 'BOM')}
                style={{ marginTop: 0, padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                📋 Logs
              </button>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Field Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              
              {/* Finished Product */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Finished Product *</label>
                <select
                  className="filter-control-select"
                  value={finishedProduct}
                  onChange={(e) => setFinishedProduct(e.target.value)}
                >
                  {productList.map(prod => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Quantity *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.01"
                    className="filter-control-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0.01, parseFloat(e.target.value) || 1.0))}
                    style={{ flex: 1 }}
                    min={0.01}
                    required
                  />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Units</span>
                </div>
              </div>

              {/* Reference (Max 8 characters) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Reference (Max 8 Char) *</label>
                <input
                  type="text"
                  maxLength={8}
                  className="filter-control-input"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.substring(0, 8))}
                  placeholder="e.g. BOM-A1"
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                  {reference.length}/8 characters
                </span>
              </div>

            </div>

            {/* Tabs Selector Bar */}
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
                      <th style={{ width: '180px' }}>To Consume</th>
                      <th style={{ width: '120px' }}>Units</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((line, idx) => (
                      <tr key={line.id}>
                        <td>
                          <select
                            className="filter-control-select"
                            value={line.name}
                            onChange={(e) => handleUpdateComponentLine(line.id, 'name', e.target.value)}
                            style={{ width: '100%' }}
                          >
                            {COMPONENT_LIST.map(cName => (
                              <option key={cName} value={cName}>{cName}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="filter-control-input"
                            value={line.qty}
                            onChange={(e) => handleUpdateComponentLine(line.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                          />
                        </td>
                        <td style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                          {line.unit}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleRemoveComponentLine(line.id)}
                            style={{ 
                              padding: '6px 10px', 
                              borderColor: '#ef4444', 
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleAddComponentLine}
                  style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                >
                  ＋ Add a product
                </button>
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
                      <th style={{ width: '180px' }}>Expected Duration (min)</th>
                      <th style={{ width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {workOrders.map((line, idx) => (
                      <tr key={line.id}>
                        <td>
                          <input
                            type="text"
                            className="filter-control-input"
                            value={line.operation}
                            onChange={(e) => handleUpdateWorkOrderLine(line.id, 'operation', e.target.value)}
                            placeholder="Operation details"
                          />
                        </td>
                        <td>
                          <select
                            className="filter-control-select"
                            value={line.workCenter}
                            onChange={(e) => handleUpdateWorkOrderLine(line.id, 'workCenter', e.target.value)}
                            style={{ width: '100%' }}
                          >
                            {WORK_CENTER_LIST.map(wc => (
                              <option key={wc} value={wc}>{wc}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="filter-control-input"
                            value={line.duration}
                            onChange={(e) => handleUpdateWorkOrderLine(line.id, 'duration', Math.max(1, parseInt(e.target.value) || 1))}
                            min={1}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleRemoveWorkOrderLine(line.id)}
                            style={{ 
                              padding: '6px 10px', 
                              borderColor: '#ef4444', 
                              color: '#ef4444',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleAddWorkOrderLine}
                  style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                >
                  ＋ Add a line
                </button>
              </div>
            )}

          </form>
        </div>
      )}

    </div>
  );
}

export default BOM;
