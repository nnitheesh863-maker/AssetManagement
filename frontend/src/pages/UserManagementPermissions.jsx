import React from 'react';

/* ═══════════════════════════════════════════
   Permission data matching the wireframe
   Module | Action | Admin | User | None
═══════════════════════════════════════════ */
const PERM_ROWS = [
  { module: 'Sales',         action: 'View',              admin: true,  user: true,      none: 'Optional' },
  { module: 'Sales',         action: 'Create',            admin: true,  user: true,      none: false },
  { module: 'Sales',         action: 'Edit',              admin: true,  user: 'Limited', none: false },
  { module: 'Sales',         action: 'Delete',            admin: true,  user: false,     none: false },
  { module: 'Sales',         action: 'Approve (Confirm)', admin: true,  user: false,     none: false },
  { module: 'Purchase',      action: 'View',              admin: true,  user: true,      none: 'Optional' },
  { module: 'Purchase',      action: 'Approve',           admin: true,  user: false,     none: false },
  { module: 'Purchase',      action: 'Edit',              admin: true,  user: 'Limited', none: false },
  { module: 'Purchase',      action: 'Create',            admin: true,  user: true,      none: false },
  { module: 'Manufacturing', action: 'Production Entry',  admin: true,  user: true,      none: false },
  { module: 'Manufacturing', action: 'Edit BOM',          admin: true,  user: false,     none: false },
  { module: 'Manufacturing', action: 'View',              admin: true,  user: true,      none: 'Optional' },
  { module: 'Product',       action: 'View',              admin: true,  user: true,      none: 'Optional' },
  { module: 'Product',       action: 'Create',            admin: true,  user: true,      none: false },
  { module: 'Product',       action: 'Edit',              admin: true,  user: 'Limited', none: false },
];

function PermCell({ val }) {
  if (val === true)
    return <span style={{ color: '#5D7052', fontSize: '18px', fontWeight: '900' }}>✓</span>;
  if (val === false)
    return <span style={{ color: '#D95B5B', fontSize: '17px', fontWeight: '900' }}>✗</span>;
  if (val === 'Optional')
    return <span style={{ fontSize: '11px', fontWeight: '700', color: '#5D7052', background: 'rgba(93,112,82,0.12)', borderRadius: '6px', padding: '3px 10px' }}>Optional</span>;
  if (val === 'Limited')
    return <span style={{ fontSize: '11px', fontWeight: '700', color: '#CF8E6D', background: 'rgba(207,142,109,0.12)', borderRadius: '6px', padding: '3px 10px' }}>Limited</span>;
  return <span style={{ fontSize: '11px', fontWeight: '700', color: '#a0683a', background: 'rgba(207,142,109,0.10)', borderRadius: '6px', padding: '3px 10px' }}>{String(val)}</span>;
}

export default function UserManagementPermissions() {
  // Group rows by module for section separators
  const modules = [...new Set(PERM_ROWS.map(r => r.module))];
  
  // Stats
  const totalRules = PERM_ROWS.length;
  const adminFull  = PERM_ROWS.filter(r => r.admin === true).length;
  const userDenied = PERM_ROWS.filter(r => r.user === false).length;

  return (
    <div className="page-content animated fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #CF8E6D, #a0683a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 18px rgba(207,142,109,0.30)' }}>
            <svg fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2.2" style={{ width: '24px', height: '24px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>User Management Permissions</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Global policy matrix governing system administrators and general user actions across all modules.</p>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Total Rules',     value: totalRules, color: '#CF8E6D',  bg: 'rgba(207,142,109,0.08)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { label: 'Modules',         value: modules.length, color: '#5D7052', bg: 'rgba(93,112,82,0.08)',   icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { label: 'Admin Full Access', value: adminFull, color: '#5D7052',  bg: 'rgba(93,112,82,0.08)',    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'User Restricted',  value: userDenied, color: '#D95B5B', bg: 'rgba(217,91,91,0.08)',    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
        ].map(({ label, value, color, bg, icon }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '16px',
            border: '1.5px solid rgba(207,142,109,0.12)', padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{value}</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PERMISSIONS TABLE ── */}
      <div style={{
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '18px',
        border: '1.5px solid rgba(207,142,109,0.14)', boxShadow: '0 4px 24px rgba(78,59,49,0.06)', padding: '24px',
      }}>
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>Global Policy</div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Role-Based Access Control</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#5D7052' }}>
              <span style={{ fontSize: '15px' }}>✓</span> Allowed
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: '600', color: '#D95B5B', marginLeft: '8px' }}>
              <span style={{ fontSize: '14px' }}>✗</span> Denied
            </span>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1.5px solid rgba(207,142,109,0.14)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'rgba(207,142,109,0.06)' }}>
                {['Module', 'Action', 'Admin', 'User', 'None / Guest'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i < 2 ? 'left' : 'center',
                    padding: '13px 16px',
                    fontSize: '11px',
                    fontWeight: '800',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                    borderBottom: '2px solid rgba(207,142,109,0.14)',
                    minWidth: i < 2 ? '140px' : '90px',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERM_ROWS.map((row, i) => {
                const prevModule = i > 0 ? PERM_ROWS[i - 1].module : '';
                const isNewModule = row.module !== prevModule;
                return (
                  <tr key={i} style={{
                    background: i % 2 === 0 ? 'transparent' : 'rgba(207,142,109,0.025)',
                    borderTop: isNewModule && i > 0 ? '2px solid rgba(207,142,109,0.12)' : 'none',
                  }}>
                    <td style={{
                      padding: '11px 16px',
                      fontWeight: isNewModule ? '700' : '500',
                      color: isNewModule ? 'var(--text-primary)' : 'transparent',
                      borderBottom: '1px solid rgba(207,142,109,0.07)',
                      fontSize: isNewModule ? '14px' : '13px',
                    }}>
                      {isNewModule ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#CF8E6D', flexShrink: 0 }} />
                          {row.module}
                        </div>
                      ) : null}
                    </td>
                    <td style={{ padding: '11px 16px', fontWeight: '600', color: 'var(--text-primary)', borderBottom: '1px solid rgba(207,142,109,0.07)' }}>{row.action}</td>
                    <td style={{ textAlign: 'center', padding: '11px 16px', borderBottom: '1px solid rgba(207,142,109,0.07)' }}><PermCell val={row.admin} /></td>
                    <td style={{ textAlign: 'center', padding: '11px 16px', borderBottom: '1px solid rgba(207,142,109,0.07)' }}><PermCell val={row.user} /></td>
                    <td style={{ textAlign: 'center', padding: '11px 16px', borderBottom: '1px solid rgba(207,142,109,0.07)' }}><PermCell val={row.none} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODULE SUMMARY CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {modules.map(mod => {
          const rows = PERM_ROWS.filter(r => r.module === mod);
          const allowed = rows.filter(r => r.user === true).length;
          const denied  = rows.filter(r => r.user === false).length;
          const limited = rows.filter(r => r.user === 'Limited').length;
          return (
            <div key={mod} style={{
              background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '16px',
              border: '1.5px solid rgba(207,142,109,0.12)', padding: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>{mod}</h4>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>{rows.length} actions</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, background: 'rgba(93,112,82,0.08)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#5D7052' }}>{allowed}</div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#5D7052', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Allowed</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(217,91,91,0.08)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#D95B5B' }}>{denied}</div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#D95B5B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Denied</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(207,142,109,0.08)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#CF8E6D' }}>{limited}</div>
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#CF8E6D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Limited</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
