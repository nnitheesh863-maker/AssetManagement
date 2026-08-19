export const mockDashboardData = {
  salesOrders: [
    // Confirmed - 7 items
    { id: 'SO-001', name: 'Deluxe Oak Dining Table', type: 'Custom Dining', status: 'Confirmed', amount: '$1,200', date: '2026-08-19', owner: 'Mahesh Gupta' },
    { id: 'SO-002', name: 'Ash Wood Chair Pack', type: 'Dining Room', status: 'Confirmed', amount: '$380', date: '2026-08-18', owner: 'Mahesh Gupta' },
    { id: 'SO-003', name: 'Beech Wood Bedframe', type: 'Bedroom Series', status: 'Confirmed', amount: '$1,100', date: '2026-08-17', owner: 'Mahesh Gupta' },
    { id: 'SO-004', name: 'Cedar Garden Table', type: 'Patio Series', status: 'Confirmed', amount: '$720', date: '2026-08-16', owner: 'Mahesh Gupta' },
    { id: 'SO-005', name: 'Cherry Wood Bookshelf', type: 'Living Room', status: 'Confirmed', amount: '$950', date: '2026-08-16', owner: 'Mahesh Gupta' },
    { id: 'SO-006', name: 'Birch Coffee Table', type: 'Living Room', status: 'Confirmed', amount: '$410', date: '2026-08-15', owner: 'Mahesh Gupta' },
    { id: 'SO-007', name: 'Walnut Sideboard', type: 'Custom Dining', status: 'Confirmed', amount: '$1,500', date: '2026-08-14', owner: 'Mahesh Gupta' },
    
    // Draft - 2 items (1 is My, 1 is other)
    { id: 'SO-008', name: 'Maple Nightstand', type: 'Bedroom Series', status: 'Draft', amount: '$290', date: '2026-08-19', owner: 'Mahesh Gupta' },
    { id: 'SO-009', name: 'Pine Dressing Cabinet', type: 'Bedroom Series', status: 'Draft', amount: '$420', date: '2026-08-19', owner: 'Ravi Verma' },
    
    // Partially Delivered - 1 item
    { id: 'SO-010', name: 'Premium Tufted Couch', type: 'Living Room', status: 'Partially Delivered', amount: '$2,450', date: '2026-08-18', owner: 'Mahesh Gupta' },
    
    // Delivered - 11 items (5 are My, 6 are other)
    { id: 'SO-011', name: 'Classic Walnut Desk', type: 'Office Series', status: 'Delivered', amount: '$850', date: '2026-08-17', owner: 'Mahesh Gupta' },
    { id: 'SO-012', name: 'Pine Wardrobe', type: 'Bedroom Series', status: 'Delivered', amount: '$1,050', date: '2026-08-13', owner: 'Mahesh Gupta' },
    { id: 'SO-013', name: 'Oak Dresser', type: 'Bedroom Series', status: 'Delivered', amount: '$880', date: '2026-08-12', owner: 'Mahesh Gupta' },
    { id: 'SO-014', name: 'Office Swivel Chair', type: 'Office Series', status: 'Delivered', amount: '$320', date: '2026-08-11', owner: 'Mahesh Gupta' },
    { id: 'SO-015', name: 'Modern Desk Lamp', type: 'Office Series', status: 'Delivered', amount: '$150', date: '2026-08-10', owner: 'Mahesh Gupta' },
    { id: 'SO-016', name: 'Velvet Accent Chair', type: 'Living Room', status: 'Delivered', amount: '$490', date: '2026-08-09', owner: 'Ravi Verma' },
    { id: 'SO-017', name: 'Rustic Shelving Unit', type: 'Office Series', status: 'Delivered', amount: '$270', date: '2026-08-08', owner: 'Ravi Verma' },
    { id: 'SO-018', name: 'Leather Couch', type: 'Living Room', status: 'Delivered', amount: '$2,800', date: '2026-08-07', owner: 'Ravi Verma' },
    { id: 'SO-019', name: 'Marble Top Sideboard', type: 'Custom Dining', status: 'Delivered', amount: '$1,950', date: '2026-08-06', owner: 'Ravi Verma' },
    { id: 'SO-020', name: 'Folding Patio Chair', type: 'Patio Series', status: 'Delivered', amount: '$180', date: '2026-08-05', owner: 'Ravi Verma' },
    { id: 'SO-021', name: 'Bar Stool Set', type: 'Dining Room', status: 'Delivered', amount: '$440', date: '2026-08-04', owner: 'Ravi Verma' },
    
    // Late - 11 items
    { id: 'SO-022', name: 'Custom Cedar Wardrobe', type: 'Bedroom Series', status: 'Late', amount: '$2,100', date: '2026-08-01', owner: 'Mahesh Gupta' },
    { id: 'SO-023', name: 'Beech Wood Credenza', type: 'Living Room', status: 'Late', amount: '$1,350', date: '2026-08-02', owner: 'Mahesh Gupta' },
    { id: 'SO-024', name: 'Teak Sun Lounger', type: 'Patio Series', status: 'Late', amount: '$680', date: '2026-08-03', owner: 'Mahesh Gupta' },
    { id: 'SO-025', name: 'Rosewood Desk', type: 'Office Series', status: 'Late', amount: '$3,200', date: '2026-08-04', owner: 'Ravi Verma' },
    { id: 'SO-026', name: 'Alder Wood Nightstand', type: 'Bedroom Series', status: 'Late', amount: '$340', date: '2026-08-05', owner: 'Ravi Verma' },
    { id: 'SO-027', name: 'Ash Upholstered Bench', type: 'Living Room', status: 'Late', amount: '$520', date: '2026-08-06', owner: 'Ravi Verma' },
    { id: 'SO-028', name: 'Cypress Chest', type: 'Bedroom Series', status: 'Late', amount: '$890', date: '2026-08-07', owner: 'Ravi Verma' },
    { id: 'SO-029', name: 'Hickory Cabinet', type: 'Dining Room', status: 'Late', amount: '$1,150', date: '2026-08-08', owner: 'Ravi Verma' },
    { id: 'SO-030', name: 'Poplar Dresser', type: 'Bedroom Series', status: 'Late', amount: '$780', date: '2026-08-09', owner: 'Ravi Verma' },
    { id: 'SO-031', name: 'Red Oak Console', type: 'Living Room', status: 'Late', amount: '$920', date: '2026-08-10', owner: 'Ravi Verma' },
    { id: 'SO-032', name: 'Spruce Shelves', type: 'Office Series', status: 'Late', amount: '$240', date: '2026-08-11', owner: 'Ravi Verma' }
  ],
  purchaseOrders: [
    // Confirmed - 7 items
    { id: 'PO-001', name: 'Heavy Duty Wood Screws', type: 'Fasteners', status: 'Confirmed', amount: '$600', date: '2026-08-18', owner: 'Mahesh Gupta' },
    { id: 'PO-002', name: 'Sanding Discs Box', type: 'Abrasives', status: 'Confirmed', amount: '$240', date: '2026-08-18', owner: 'Mahesh Gupta' },
    { id: 'PO-003', name: 'Oak Wood Veneer Rolls', type: 'Veneers', status: 'Confirmed', amount: '$1,400', date: '2026-08-17', owner: 'Mahesh Gupta' },
    { id: 'PO-004', name: 'Industrial Polyurethane', type: 'Finishes', status: 'Confirmed', amount: '$850', date: '2026-08-16', owner: 'Mahesh Gupta' },
    { id: 'PO-005', name: 'Brass Pull Handles', type: 'Hardware', status: 'Confirmed', amount: '$310', date: '2026-08-16', owner: 'Mahesh Gupta' },
    { id: 'PO-006', name: 'Drawer Slider Rails', type: 'Hardware', status: 'Confirmed', amount: '$590', date: '2026-08-15', owner: 'Mahesh Gupta' },
    { id: 'PO-007', name: 'Dowling Pins Pack', type: 'Fasteners', status: 'Confirmed', amount: '$120', date: '2026-08-14', owner: 'Mahesh Gupta' },
    
    // Draft - 2 items (1 is My, 1 is other)
    { id: 'PO-008', name: 'Leather Upholstery Rolls', type: 'Fabric Fabrics', status: 'Draft', amount: '$3,200', date: '2026-08-19', owner: 'Mahesh Gupta' },
    { id: 'PO-009', name: 'Foam Cushion Blocks', type: 'Filling padding', status: 'Draft', amount: '$1,500', date: '2026-08-19', owner: 'Ravi Verma' },
    
    // Partially Received - 1 item
    { id: 'PO-010', name: 'Premium Finish Stain & Oil', type: 'Coatings', status: 'Partially Received', amount: '$1,200', date: '2026-08-17', owner: 'Mahesh Gupta' },
    
    // Received - 11 items (5 are My, 6 are other)
    { id: 'PO-011', name: 'Raw Teak Lumber Logs', type: 'Raw Materials', status: 'Received', amount: '$4,500', date: '2026-08-19', owner: 'Mahesh Gupta' },
    { id: 'PO-012', name: 'Walnut Planks Premium', type: 'Raw Materials', status: 'Received', amount: '$3,800', date: '2026-08-13', owner: 'Mahesh Gupta' },
    { id: 'PO-013', name: 'Plywood Sheets Pack', type: 'Raw Materials', status: 'Received', amount: '$2,100', date: '2026-08-12', owner: 'Mahesh Gupta' },
    { id: 'PO-014', name: 'Steel Table Legs (U-shape)', type: 'Hardware', status: 'Received', amount: '$1,800', date: '2026-08-11', owner: 'Mahesh Gupta' },
    { id: 'PO-015', name: 'Upholstery Springs Set', type: 'Hardware', status: 'Received', amount: '$740', date: '2026-08-10', owner: 'Mahesh Gupta' },
    { id: 'PO-016', name: 'High-Density Foam Rolls', type: 'Filling padding', status: 'Received', amount: '$2,300', date: '2026-08-09', owner: 'Ravi Verma' },
    { id: 'PO-017', name: 'Linen Upholstery Bolts', type: 'Fabric Fabrics', status: 'Received', amount: '$1,650', date: '2026-08-08', owner: 'Ravi Verma' },
    { id: 'PO-018', name: 'MDF Wood Board Pack', type: 'Raw Materials', status: 'Received', amount: '$1,100', date: '2026-08-07', owner: 'Ravi Verma' },
    { id: 'PO-019', name: 'Tung Oil Containers', type: 'Coatings', status: 'Received', amount: '$540', date: '2026-08-06', owner: 'Ravi Verma' },
    { id: 'PO-020', name: 'Wood Glue Barrels', type: 'Adhesives', status: 'Received', amount: '$980', date: '2026-08-05', owner: 'Ravi Verma' },
    { id: 'PO-021', name: 'Cabinet Soft-Close Hinges', type: 'Hardware', status: 'Received', amount: '$850', date: '2026-08-04', owner: 'Ravi Verma' },
    
    // Late - 11 items
    { id: 'PO-022', name: 'Tempered Glass Tabletop Panels', type: 'Tabletops', status: 'Late', amount: '$2,700', date: '2026-08-01', owner: 'Mahesh Gupta' },
    { id: 'PO-023', name: 'Brass Inlay Strips', type: 'Hardware Decor', status: 'Late', amount: '$420', date: '2026-08-02', owner: 'Mahesh Gupta' },
    { id: 'PO-024', name: 'Velvet Fabric Rolls', type: 'Fabric Fabrics', status: 'Late', amount: '$2,900', date: '2026-08-03', owner: 'Mahesh Gupta' },
    { id: 'PO-025', name: 'Epoxy Resin Barrels', type: 'Adhesives', status: 'Late', amount: '$1,500', date: '2026-08-04', owner: 'Ravi Verma' },
    { id: 'PO-026', name: 'Heavy Duty Caster Wheels', type: 'Hardware', status: 'Late', amount: '$360', date: '2026-08-05', owner: 'Ravi Verma' },
    { id: 'PO-027', name: 'Threaded Inserts Box', type: 'Fasteners', status: 'Late', amount: '$180', date: '2026-08-06', owner: 'Ravi Verma' },
    { id: 'PO-028', name: 'White Oak Veneer Rolls', type: 'Veneers', status: 'Late', amount: '$1,250', date: '2026-08-07', owner: 'Ravi Verma' },
    { id: 'PO-029', name: 'Sanding Belts Assortment', type: 'Abrasives', status: 'Late', amount: '$310', date: '2026-08-08', owner: 'Ravi Verma' },
    { id: 'PO-030', name: 'Semi-Gloss Clear Varnish', type: 'Coatings', status: 'Late', amount: '$690', date: '2026-08-09', owner: 'Ravi Verma' },
    { id: 'PO-031', name: 'Magnetic Cabinet Catches', type: 'Hardware', status: 'Late', amount: '$140', date: '2026-08-10', owner: 'Ravi Verma' },
    { id: 'PO-032', name: 'Flat Head Timber Screws', type: 'Fasteners', status: 'Late', amount: '$220', date: '2026-08-11', owner: 'Ravi Verma' }
  ],
  manufacturingOrders: [
    // Confirmed - 7 items
    { id: 'MO-001', name: 'Cushion Padding - Sofa Sets', type: 'Upholstery Dep', status: 'Confirmed', qty: '5 units', date: '2026-08-19', owner: 'Mahesh Gupta' },
    { id: 'MO-002', name: 'Armchair Frame Welding', type: 'Assembly Line', status: 'Confirmed', qty: '8 units', date: '2026-08-19', owner: 'Mahesh Gupta' },
    { id: 'MO-003', name: 'Desk Base Assembly', type: 'Assembly Line', status: 'Confirmed', qty: '12 units', date: '2026-08-18', owner: 'Mahesh Gupta' },
    { id: 'MO-004', name: 'Wardrobe Panel Joining', type: 'Pre-Production', status: 'Confirmed', qty: '15 units', date: '2026-08-18', owner: 'Mahesh Gupta' },
    { id: 'MO-005', name: 'Nightstand Box Assembly', type: 'Assembly Line', status: 'Confirmed', qty: '20 units', date: '2026-08-17', owner: 'Mahesh Gupta' },
    { id: 'MO-006', name: 'Chair Leg Joint Pinning', type: 'Pre-Production', status: 'Confirmed', qty: '30 units', date: '2026-08-17', owner: 'Mahesh Gupta' },
    { id: 'MO-007', name: 'Garden Table Slats Assembly', type: 'Assembly Line', status: 'Confirmed', qty: '6 units', date: '2026-08-16', owner: 'Mahesh Gupta' },
    
    // Draft - 2 items (1 is My, 1 is other)
    { id: 'MO-008', name: 'Board Cutting - Wardrobes', type: 'Pre-Production', status: 'Draft', qty: '20 units', date: '2026-08-17', owner: 'Mahesh Gupta' },
    { id: 'MO-009', name: 'Sideboard Frame Cutting', type: 'Pre-Production', status: 'Draft', qty: '10 units', date: '2026-08-17', owner: 'Ravi Verma' },
    
    // In Progress - 1 item
    { id: 'MO-010', name: 'Table Assembly - Teak Dining', type: 'Assembly Line', status: 'In Progress', qty: '10 units', date: '2026-08-19', owner: 'Mahesh Gupta' },
    
    // To Close - 5 items (all are All)
    { id: 'MO-011', name: 'Hardware Fitting - Cabinets', type: 'Assembly Line', status: 'To Close', qty: '8 units', date: '2026-08-16', owner: 'Ravi Verma' },
    { id: 'MO-012', name: 'Upholstery Cover Stapling', type: 'Upholstery Dep', status: 'To Close', qty: '15 units', date: '2026-08-15', owner: 'Ravi Verma' },
    { id: 'MO-013', name: 'Drawer Track Screw-in', type: 'Assembly Line', status: 'To Close', qty: '25 units', date: '2026-08-15', owner: 'Ravi Verma' },
    { id: 'MO-014', name: 'Mirror Inlay Gluing', type: 'Finishing Line', status: 'To Close', qty: '10 units', date: '2026-08-14', owner: 'Ravi Verma' },
    { id: 'MO-015', name: 'Patio Cushion Cord Sewing', type: 'Upholstery Dep', status: 'To Close', qty: '12 units', date: '2026-08-13', owner: 'Ravi Verma' },
    
    // Done - 11 items (5 are My, 6 are other)
    { id: 'MO-016', name: 'Sanding & Polishing Desks', type: 'Finishing Line', status: 'Done', qty: '12 units', date: '2026-08-18', owner: 'Mahesh Gupta' },
    { id: 'MO-017', name: 'Dining Table Varnishing', type: 'Finishing Line', status: 'Done', qty: '6 units', date: '2026-08-15', owner: 'Mahesh Gupta' },
    { id: 'MO-018', name: 'Sofa Springs Tensioning', type: 'Upholstery Dep', status: 'Done', qty: '8 units', date: '2026-08-14', owner: 'Mahesh Gupta' },
    { id: 'MO-019', name: 'Desk Drawer Fitting', type: 'Assembly Line', status: 'Done', qty: '20 units', date: '2026-08-13', owner: 'Mahesh Gupta' },
    { id: 'MO-020', name: 'Staining Oak Chairs', type: 'Finishing Line', status: 'Done', qty: '24 units', date: '2026-08-12', owner: 'Mahesh Gupta' },
    { id: 'MO-021', name: 'Patio Bench Oil Coating', type: 'Finishing Line', status: 'Done', qty: '10 units', date: '2026-08-11', owner: 'Ravi Verma' },
    { id: 'MO-022', name: 'Bookshelf Shelf Dowelling', type: 'Assembly Line', status: 'Done', qty: '18 units', date: '2026-08-10', owner: 'Ravi Verma' },
    { id: 'MO-023', name: 'Couch Frame Stapling', type: 'Upholstery Dep', status: 'Done', qty: '5 units', date: '2026-08-09', owner: 'Ravi Verma' },
    { id: 'MO-024', name: 'Desk Cable Port Drilling', type: 'Assembly Line', status: 'Done', qty: '30 units', date: '2026-08-08', owner: 'Ravi Verma' },
    { id: 'MO-025', name: 'Outdoor Table Sealing', type: 'Finishing Line', status: 'Done', qty: '4 units', date: '2026-08-07', owner: 'Ravi Verma' },
    { id: 'MO-026', name: 'Chest of Drawers Levelling', type: 'Assembly Line', status: 'Done', qty: '15 units', date: '2026-08-06', owner: 'Ravi Verma' }
  ],
  recentActivities: [
    { id: 'act-1', text: 'Mahesh Gupta created Sales Order SO-001', time: '2 minutes ago' },
    { id: 'act-2', text: 'Amit Sharma updated Product PROD-0034 (Teak Veneer)', time: '10 minutes ago' },
    { id: 'act-3', text: 'Meera Sen confirmed Purchase Order PO-001', time: '20 minutes ago' },
    { id: 'act-4', text: 'Ravi Verma completed Manufacturing Order MO-016', time: '35 minutes ago' }
  ]
};
