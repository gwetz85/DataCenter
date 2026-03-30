import type { Role } from '../types/auth';

type MenuPath = 
  | '/dashboard' 
  | '/registrasi' 
  | '/verifikasi-data' 
  | '/data-pengajuan' 
  | '/validasi-data' 
  | '/finish' 
  | '/data-ditolak'
  | '/manajemen-pengguna' 
  | '/chat-monitoring'
  | '/event'
  | '/cek-halal'
  | '/pengaturan';

// Define which menus are accessible by each role
export const rolePermissions: Record<Role, MenuPath[]> = {
  Admin: [
    '/dashboard', '/registrasi', '/verifikasi-data', '/data-pengajuan', 
    '/validasi-data', '/finish', '/data-ditolak',
    '/manajemen-pengguna', '/chat-monitoring', '/event', '/cek-halal', '/pengaturan'
  ],
  Verifikator: [
    '/dashboard', '/verifikasi-data', '/validasi-data', '/finish', '/event', '/cek-halal', '/pengaturan'
  ],
  Monitoring: [
    '/dashboard', '/verifikasi-data', '/data-pengajuan', '/validasi-data', '/finish', '/event', '/cek-halal', '/pengaturan'
  ],
  Petugas: [
    '/dashboard', '/registrasi', '/data-pengajuan', '/finish', '/event', '/cek-halal', '/pengaturan'
  ],
  Guest: []
};

// Check if a role can access a specific path
export function canAccessMenu(role: Role, path: MenuPath | string): boolean {
  return rolePermissions[role].includes(path as MenuPath);
}

// Check if a role has Edit/Add/Delete permissions for a specific menu
export function canPerformAction(role: Role, path: MenuPath | string, action: 'view' | 'add' | 'edit' | 'delete'): boolean {
  if (!canAccessMenu(role, path)) return false;
  if (action === 'view') return true;
  
  // Monitoring can ONLY view
  if (role === 'Monitoring') return false;

  // Admin can do anything on allowed menus
  if (role === 'Admin') return true;

  // Petugas specific rules
  if (role === 'Petugas') {
    if (path === '/registrasi') return action === 'add' || action === 'edit';
    if (path === '/data-pengajuan') return action === 'edit';
    if (path === '/event') return action === 'add' || action === 'edit';
    return false; // Default for Petugas on other menus (like Finish)
  }

  // Verifikator specific rules
  if (role === 'Verifikator') {
    if (path === '/verifikasi-data') return action === 'edit' || action === 'delete';
    if (path === '/validasi-data') return action === 'edit' || action === 'delete';
    return false; // Default for Verifikator
  }

  return false;
}

// Deprecated for better specificity: canPerformAction
export function canEdit(role: Role, path: MenuPath | string): boolean {
  return canPerformAction(role, path, 'edit');
}
