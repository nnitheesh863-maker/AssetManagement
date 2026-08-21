import React, { useState, useEffect } from 'react';

const CATEGORY_LIST = [
  'Custom Dining',
  'Dining Room',
  'Bedroom Series',
  'Patio Series',
  'Living Room',
  'Office Series',
  'Assembly Line',
  'Pre-Production'
];

function Products({ currentUser }) {
  const role = currentUser?.role || '';
  const position = (currentUser?.position || '').toLowerCase();
  const isAdmin = role === 'System Administrator' || role === 'ADMIN' || position.includes('admin');
  const canEdit = isAdmin || role === 'INVENTORY_MANAGER' || role === 'BUSINESS_OWNER' || position.includes('warehouse') || position.includes('manager');

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('assetflow_products');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'PROD-001', name: 'Deluxe Oak Dining Table', category: 'Custom Dining', salesPrice: 1200, costPrice: 800 },
      { id: 'PROD-002', name: 'Ash Wood Chair Pack', category: 'Dining Room', salesPrice: 380, costPrice: 250 },
      { id: 'PROD-003', name: 'Beech Wood Bedframe', category: 'Bedroom Series', salesPrice: 1100, costPrice: 750 },
      { id: 'PROD-004', name: 'Cedar Garden Table', category: 'Patio Series', salesPrice: 720, costPrice: 480 },
      { id: 'PROD-005', name: 'Cherry Wood Bookshelf', category: 'Living Room', salesPrice: 950, costPrice: 620 },
      { id: 'PROD-006', name: 'Birch Coffee Table', category: 'Living Room', salesPrice: 410, costPrice: 270 },
      { id: 'PROD-007', name: 'Walnut Sideboard', category: 'Custom Dining', salesPrice: 1500, costPrice: 1000 },
      { id: 'PROD-008', name: 'Door Frames', category: 'Pre-Production', salesPrice: 150, costPrice: 90 },
      { id: 'PROD-009', name: 'Lighting Frame', category: 'Assembly Line', salesPrice: 200, costPrice: 120 }
    ];
  });
  const [activeView, setActiveView] = useState('list'); // 'list' | 'kanban' | 'form'
  const [selectedProduct, setSelectedProduct] = useState(null); // null for new
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Form Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_LIST[0]);
  const [salesPrice, setSalesPrice] = useState(100);
  const [costPrice, setCostPrice] = useState(60);

  const API_BASE_URL = 'http://localhost:5000/api';

  const syncToBackend = (method, endpoint, bodyObj) => {
    const token = localStorage.getItem('assetflow_token');
    fetch(`${API_BASE_URL}/${endpoint}`, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bodyObj)
    }).catch(err => console.warn(`Failed to sync ${method} ${endpoint} to backend:`, err));
  };

  const createAuditLog = (action, prodId) => {
    const today = new Date();
    const formattedDate = today.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    const logObj = {
      datetime: formattedDate,
      user: 'Amit Sharma', // default supervisor/user
      module: 'Products',
      type: 'Product Item',
      id: prodId,
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

  // Load products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('assetflow_token');
        const res = await fetch(`${API_BASE_URL}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setProducts(data);
            localStorage.setItem('assetflow_products', JSON.stringify(data));
            return;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch products from backend, using localStorage.", err);
      }

      const saved = localStorage.getItem('assetflow_products');
      if (saved) {
        setProducts(JSON.parse(saved));
      } else {
        const initial = [
          { id: 'PROD-001', name: 'Deluxe Oak Dining Table', category: 'Custom Dining', salesPrice: 1200, costPrice: 800 },
          { id: 'PROD-002', name: 'Ash Wood Chair Pack', category: 'Dining Room', salesPrice: 380, costPrice: 250 },
          { id: 'PROD-003', name: 'Beech Wood Bedframe', category: 'Bedroom Series', salesPrice: 1100, costPrice: 750 },
          { id: 'PROD-004', name: 'Cedar Garden Table', category: 'Patio Series', salesPrice: 720, costPrice: 480 },
          { id: 'PROD-005', name: 'Cherry Wood Bookshelf', category: 'Living Room', salesPrice: 950, costPrice: 620 },
          { id: 'PROD-006', name: 'Birch Coffee Table', category: 'Living Room', salesPrice: 410, costPrice: 270 },
          { id: 'PROD-007', name: 'Walnut Sideboard', category: 'Custom Dining', salesPrice: 1500, costPrice: 1000 },
          { id: 'PROD-008', name: 'Door Frames', category: 'Pre-Production', salesPrice: 150, costPrice: 90 },
          { id: 'PROD-009', name: 'Lighting Frame', category: 'Assembly Line', salesPrice: 200, costPrice: 120 }
        ];
        setProducts(initial);
        localStorage.setItem('assetflow_products', JSON.stringify(initial));
      }
    };

    fetchProducts();
  }, []);

  const saveProducts = (updatedList) => {
    setProducts(updatedList);
    localStorage.setItem('assetflow_products', JSON.stringify(updatedList));
  };

  // Open Form for Editing
  const handleEditProduct = (prod) => {
    setSelectedProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setSalesPrice(prod.salesPrice);
    setCostPrice(prod.costPrice);
    setActiveView('form');
  };

  // Open Form for Creating New
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setName('');
    setCategory(CATEGORY_LIST[0]);
    setSalesPrice(100);
    setCostPrice(60);
    setActiveView('form');
  };

  // Save Product Form
  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!name) {
      alert('Please fill out the product name.');
      return;
    }

    if (selectedProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === selectedProduct.id) {
          const updatedObj = {
            ...p,
            name,
            category,
            salesPrice: parseFloat(salesPrice) || 0,
            costPrice: parseFloat(costPrice) || 0
          };

          const backendObj = {
            id: updatedObj.id,
            name: updatedObj.name,
            category: updatedObj.category,
            salesPrice: updatedObj.salesPrice,
            costPrice: updatedObj.costPrice
          };
          syncToBackend('PUT', `products/${updatedObj.id}`, backendObj);
          createAuditLog('Updated', updatedObj.id);
          return updatedObj;
        }
        return p;
      });
      saveProducts(updated);
    } else {
      // Create new
      const nextNum = products.length + 1;
      const newId = `PROD-${String(nextNum).padStart(3, '0')}`;
      const newProd = {
        id: newId,
        name,
        category,
        salesPrice: parseFloat(salesPrice) || 0,
        costPrice: parseFloat(costPrice) || 0
      };

      const backendObj = {
        id: newProd.id,
        name: newProd.name,
        category: newProd.category,
        salesPrice: newProd.salesPrice,
        costPrice: newProd.costPrice
      };
      syncToBackend('POST', 'products', backendObj);
      createAuditLog('Created', newProd.id);
      saveProducts([...products, newProd]);
    }
    setActiveView('list');
  };

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
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

  // Filter products by search
  const filteredProducts = products.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content animated fadeIn">
      
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>Products Catalog</h2>
          <p className="sys-desc" style={{ margin: '4px 0 0 0' }}>Manage product models, sales/cost price rules and design configurations</p>
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
          {currentUser?.role === 'Admin' && (
            <button 
              className="btn btn-primary" 
              onClick={handleNewProduct}
              style={{ marginTop: 0, background: '#2563eb', borderColor: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Product
            </button>
          )}
        </div>
      </div>

      {/* 1. LIST VIEW */}
      {activeView === 'list' && (
        <div className="card glass erp-dashboard-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search by ID, name or category..."
              className="filter-control-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '320px' }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {filteredProducts.length} products
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
                      checked={filteredProducts.length > 0 && selectedIds.length === filteredProducts.length}
                    />
                  </th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Sales Price</th>
                  <th>Cost Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(prod => (
                    <tr key={prod.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(prod.id)}
                          onChange={() => handleSelectRow(prod.id)}
                        />
                      </td>
                      <td className="order-id-cell">{prod.id}</td>
                      <td style={{ fontWeight: '600' }}>{prod.name}</td>
                      <td><span className="badge category-badge">{prod.category}</span></td>
                      <td style={{ fontWeight: '700' }}>${prod.salesPrice.toFixed(2)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>${prod.costPrice.toFixed(2)}</td>
                      <td>
                        <button className="btn btn-outline btn-small-table" onClick={() => handleEditProduct(prod)}>
                          Edit / Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                      No products found matching your search.
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
          {CATEGORY_LIST.slice(0, 4).map(catName => {
            const list = products.filter(p => p.category === catName);
            return (
              <div key={catName} className="card glass" style={{ padding: '16px', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(250, 244, 235, 0.4)' }}>
                <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '13px', color: 'var(--text-secondary)', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '2px solid var(--card-border)', paddingBottom: '8px' }}>
                  {catName} ({list.length})
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                  {list.map(prod => (
                    <div 
                      key={prod.id} 
                      onClick={() => handleEditProduct(prod)}
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
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontFamily: 'monospace' }}>{prod.id}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>${prod.salesPrice}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{prod.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cost: ${prod.costPrice}</div>
                    </div>
                  ))}
                  {list.length === 0 && (
                    <div style={{ padding: '24px', border: '1px dashed var(--card-border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                      No products
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
              {selectedProduct ? `Edit Product ${selectedProduct.id}` : 'New Product'}
            </h3>
            <span className="status-pill status-active" style={{ fontSize: '13px', fontWeight: '800', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px' }}>
              {selectedProduct ? selectedProduct.id : 'Draft'}
            </span>
          </div>

          <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Product Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Product Name *</label>
                <input
                  type="text"
                  className="filter-control-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deluxe Oak Dining Table"
                  disabled={!canEdit}
                  required
                />
              </div>

              {/* Category */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Category</label>
                <select
                  className="filter-control-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!canEdit}
                >
                  {CATEGORY_LIST.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sales Price */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Sales Price ($) *</label>
                <input
                  type="number"
                  className="filter-control-input"
                  value={salesPrice}
                  onChange={(e) => setSalesPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  min={0}
                  disabled={!canEdit}
                  required
                />
              </div>

              {/* Cost Price */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Cost Price ($) *</label>
                <input
                  type="number"
                  className="filter-control-input"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  min={0}
                  disabled={!canEdit}
                  required
                />
              </div>

            </div>

            {/* BUTTON BAR */}
            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setActiveView('list')}
                style={{ marginTop: 0 }}
              >
                Cancel
              </button>
              {canEdit && (
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ marginTop: 0, width: 'auto', padding: '0 24px' }}
                >
                  Save Product
                </button>
              )}
            </div>

          </form>
        </div>
      )}

    </div>
  );
}

export default Products;
