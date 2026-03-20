
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  FileCheck,
  FileText,
  CheckSquare,
  Activity,
  CheckCircle,
  Users,
  Settings,
  Database,
} from 'lucide-react';

// Props for responsive drawer behavior
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/registrasi', label: 'Registrasi', icon: UserPlus },
  { path: '/verifikasi-data', label: 'Verifikasi Data', icon: FileCheck },
  { path: '/data-pengajuan', label: 'Data Pengajuan', icon: FileText },
  { path: '/validasi-data', label: 'Validasi Data', icon: CheckSquare },
  { path: '/monitoring-pekerjaan', label: 'Monitoring Pekerjaan', icon: Activity },
  { path: '/finish', label: 'Finish', icon: CheckCircle },
  { path: '/manajemen-pengguna', label: 'Manajemen Pengguna', icon: Users },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`} style={{ borderRadius: '0', borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}>
      <div className="sidebar-header">
        <Database className="sidebar-icon" size={28} />
        <span>Data Centre</span>
      </div>
      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
