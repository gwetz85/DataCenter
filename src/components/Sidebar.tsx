
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessMenu } from '../utils/permissions';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, UserPlus, FileCheck, FileText, CheckSquare,
  Activity, CheckCircle, Users, Settings, Database, LogOut, Copy, RefreshCw, Clock
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/registrasi', label: 'Input Data', icon: UserPlus }, // renamed matching mockup "Input Data"
  { path: '/verifikasi-data', label: 'Verifikasi Admin', icon: FileCheck }, // renamed matching mockup "Verifikasi Admin"
  { path: '/data-pengajuan', label: 'Data Pelaku', icon: FileText },
  { path: '/validasi-data', label: 'Verifikasi Data', icon: CheckSquare },
  { path: '/monitoring-pekerjaan', label: 'Monitoring Aktif', icon: Activity },
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
        <Database size={32} strokeWidth={1.5} />
        <h1 className="ns-brand-title">DATA CENTRE</h1>
        <p className="ns-brand-subtitle">SISTEM TERPADU</p>
      </div>

      {/* Clock Box */}
      <div className="ns-clock-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="ns-clock-label">SERVER REAL-TIME</span>
          <Clock size={12} />
        </div>
        <div className="ns-clock-time">{timeString}</div>
        <div className="ns-clock-date">{dateString}</div>
      </div>

      {/* Nav Menu */}
      <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7 }}>MENU UTAMA</span>
      </div>
      <nav className="ns-nav-menu">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `ns-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div style={{ flex: 1 }}></div>

      {/* User Profile Footer */}
      {currentUser && (
        <div className="ns-user-footer">
          <div className="ns-user-card">
            <div className="ns-user-avatar">
              <span style={{ fontWeight: 800 }}>{currentUser.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ns-user-info">
              <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{currentUser.name.toUpperCase()}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <RefreshCw size={8} /> {currentUser.role.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="ns-user-id-box">
             <span style={{ opacity: 0.5 }}>ID: </span> {currentUser.id.substring(0, 16)}...
             <Copy size={12} style={{ float: 'right', marginTop: '2px', cursor: 'pointer', opacity: 0.7 }} />
          </div>

          <button onClick={logout} className="ns-logout-btn">
            <LogOut size={16} /> Keluar Sistem
          </button>
        </div>
      )}
    </aside>
  );
}
