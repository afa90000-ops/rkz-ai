import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#040812', direction: 'rtl' }}>
      <Sidebar />
      <main style={{ marginRight: '240px', minHeight: '100vh', transition: 'margin 0.3s ease' }}>
        {/* Top bar */}
        <div style={{
          height: '64px', borderBottom: '1px solid #1a2540',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: 'rgba(7,13,26,0.8)',
          backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e676', boxShadow: '0 0 8px #00e676' }} />
            <span style={{ fontSize: '12px', color: '#6b7fa3' }}>مباشر</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 14px', background: 'rgba(4,8,18,0.8)',
              border: '1px solid #1a2540', borderRadius: '8px',
            }}>
              <span style={{ fontSize: '12px', color: '#3d4f6e' }}>🔍</span>
              <input placeholder="بحث سريع..." style={{
                background: 'none', border: 'none', outline: 'none',
                color: '#e8f0ff', fontSize: '12px', width: '160px',
                fontFamily: "'Cairo', sans-serif",
              }} />
            </div>
            {/* Alert bell */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'rgba(4,8,18,0.8)', border: '1px solid #1a2540',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '16px',
              }}>🔔</div>
              <div style={{
                position: 'absolute', top: '-3px', left: '-3px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#ff3366', border: '2px solid #040812',
                fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800,
              }}>3</div>
            </div>
            {/* Avatar */}
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #00d4ff, #0066ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 800, color: 'white', cursor: 'pointer',
            }}>أ</div>
          </div>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
