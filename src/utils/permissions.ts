import type { Role } from '../types/auth';

type MenuPath = 
  | '/dashboard' 
  | '/registrasi' 
  | '/verifikasi-data' 
  | '/data-pengajuan' 
  | '/validasi-data' 
  | '/monitoring-pekerjaan' 
  | '/finish' 
  | '/data-ditolak'
  | '/manajemen-pengguna' 
  | '/pengaturan';

// Define which menus are accessible by each role
export const rolePermissions: Record<Role, MenuPath[]> = {
  Admin: [
    '/dashboard', '/registrasi', '/verifikasi-data', '/data-pengajuan', 
    '/validasi-data', '/monitoring-pekerjaan', '/finish', '/data-ditolak',
    '/manajemen-pengguna', '/pengaturan'
  ],
  Verifikator: [
    '/dashboard', '/registrasi', '/verifikasi-data', '/data-pengajuan', 
    '/monitoring-pekerjaan', '/finish', '/data-ditolak', '/pengaturan'
  ], // No Manajemen Pengguna, No Validasi Data
  Monitoring: [
    '/dashboard', '/registrasi', '/verifikasi-data', '/data-pengajuan', 
    '/validasi-data', '/monitoring-pekerjaan', '/finish', '/data-ditolak',
    '/manajemen-pengguna', '/pengaturan'
  ],
  Petugas: [
    '/dashboard', '/registrasi', '/data-pengajuan', '/finish', '/data-ditolak', '/pengaturan'
  ],
  Guest: []
};

// Check if a role can access a specific path
export function canAccessMenu(role: Role, path: MenuPath | string): boolean {
  return rolePermissions[role].includes(path as MenuPath);
}

// Check if a role has Edit/Add/Delete permissions for a specific menu
export function canEdit(role: Role, path: MenuPath | string): boolean {
  if (role === 'Monitoring') {
    return false; // Monitoring is globally read-only
  }
  
  if (role === 'Petugas' && path === '/finish') {
    return false; // Petugas is read-only on Finish
  }

  // Otherwise, if they can access it (and they aren't restricted above), they have edit rights
  return canAccessMenu(role, path);
}
