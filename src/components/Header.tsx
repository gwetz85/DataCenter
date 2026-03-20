import { Bell, Search, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="header glass-panel" style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: '0', borderBottom: '1px solid var(--border)' }}>
      <button className="hamburger" onClick={onToggleSidebar} style={{ background: 'transparent', border: 'none', marginRight: '1rem' }}><Menu size={24} color="var(--text-muted)" /></button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', width: '300px' }}>
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Cari data..." 
          style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}>
          <Bell size={24} />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%' }}></span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.name}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.role}</p>
          </div>
          <div className="avatar" style={{ marginRight: '0.5rem' }}>{currentUser.name.charAt(0)}</div>
          <button 
            onClick={logout}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              color: '#ef4444', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '0.5rem',
              borderRadius: '8px'
            }}
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
