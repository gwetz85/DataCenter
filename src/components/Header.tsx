import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
      <button className="hamburger" onClick={onToggleSidebar} style={{ background: 'transparent', border: 'none', marginRight: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <Menu size={24} color="var(--text-muted)" />
      </button>
      
      <div className="header-search">
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Cari..." 
          style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.875rem' }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative', padding: '0.5rem' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
        </button>
      </div>
    </header>
  );
}
