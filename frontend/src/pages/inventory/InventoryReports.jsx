import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';

function InventoryReports() {
  const reports = [
    {
      id: 1,
      title: 'Stock Summary Report',
      description: 'Overview of all products, current quantities, and total valuation.',
      icon: <BarChart2 size={24} className="text-blue-500" />,
      color: 'rgba(59, 130, 246, 0.1)'
    },
    {
      id: 2,
      title: 'Stock Movement Report',
      description: 'Detailed log of all inbound and outbound stock transactions.',
      icon: <TrendingUp size={24} className="text-green-500" />,
      color: 'rgba(16, 185, 129, 0.1)'
    },
    {
      id: 3,
      title: 'Low Stock Report',
      description: 'List of items currently below minimum required stock levels.',
      icon: <AlertTriangle size={24} className="text-red-500" />,
      color: 'rgba(239, 68, 68, 0.1)'
    },
    {
      id: 4,
      title: 'Inventory Valuation Report',
      description: 'Financial breakdown of stock by category and warehouse.',
      icon: <FileText size={24} className="text-purple-500" />,
      color: 'rgba(139, 92, 246, 0.1)'
    }
  ];

  return (
    <motion.div 
      className="page-content animated fadeIn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Inventory Reports</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Generate and download stock analytics reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {reports.map(report => (
          <motion.div 
            key={report.id}
            whileHover={{ y: -5 }}
            className="card glass"
            style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: report.color, borderRadius: '12px' }}>
                {report.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{report.title}</h3>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', flexGrow: 1 }}>
              {report.description}
            </p>
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Generate PDF
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default InventoryReports;
