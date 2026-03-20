
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../utils/permissions';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, UserPlus, FileCheck, CheckSquare,
  CheckCircle, Users, Settings, Database, LogOut, Copy, RefreshCw, Clock
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/registrasi', label: 'Registrasi', icon: UserPlus },
  { path: '/verifikasi-data', label: 'Verifikasi Data', icon: FileCheck },
  { path: '/data-pengajuan', label: 'Data Pengajuan', icon: Database },
  { path: '/validasi-data', label: 'Validasi Data', icon: CheckSquare },
  { path: '/finish', label: 'Finish', icon: CheckCircle },
  { path: '/manajemen-pengguna', label: 'Manajemen Pengguna', icon: Users },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const visibleNavItems = currentUser 
    ? navItems.filter(item => canAccessMenu(currentUser.role, item.path))
    : [];

  const timeString = time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
  const dateString = time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <aside className={`sidebar new-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="ns-brand">
        <Database size={24} strokeWidth={2} />
        <h1 className="ns-brand-title">DATA CENTRE</h1>
        <p className="ns-brand-subtitle">SISTEM TERPADU</p>
      </div>

      {/* Clock Box */}
      <div className="ns-clock-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
          <span className="ns-clock-label">SERVER REAL-TIME</span>
          <Clock size={10} />
        </div>
        <div className="ns-clock-time">{timeString}</div>
        <div className="ns-clock-date">{dateString}</div>
      </div>

      <nav className="ns-nav-menu">
        <div style={{ padding: '0 0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', opacity: 0.6, color: 'white' }}>MENU UTAMA</span>
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `ns-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      {currentUser && (
        <div className="ns-user-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <div className="ns-user-card" style={{ borderRadius: '18px', padding: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
            <div className="ns-user-avatar" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', color: 'var(--primary)' }}>
              <span style={{ fontWeight: 900 }}>{currentUser.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ns-user-info">
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{currentUser.name.toUpperCase()}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.7, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <RefreshCw size={10} /> {currentUser.role.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="ns-user-id-box" style={{ borderRadius: '10px', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', marginTop: '0.75rem', fontSize: '0.65rem' }}>
             <span style={{ opacity: 0.5 }}>ID: </span> {currentUser.id.substring(0, 16)}...
             <span title="Salin ID" style={{ float: 'right', cursor: 'pointer' }}><Copy size={12} style={{ opacity: 0.7 }} /></span>
          </div>

          <button onClick={logout} className="ns-logout-btn">
            <LogOut size={16} /> Keluar Sistem
          </button>
        </div>
      )}
    </aside>
  );
}
