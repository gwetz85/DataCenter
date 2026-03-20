import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types/auth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const { user, switchRole } = useAuth();

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
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</p>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select 
                value={user.role} 
                onChange={(e) => switchRole(e.target.value as Role)}
                style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  color: 'var(--text-muted)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  padding: '2px 20px 2px 8px',
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Verifikator">Verifikator</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Petugas">Petugas</option>
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: '4px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>
          <div className="avatar">{user.name.charAt(0)}</div>
        </div>
      </div>
    </header>
  );
}
