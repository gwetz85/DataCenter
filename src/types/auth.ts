export type Role = 'Admin' | 'Verifikator' | 'Monitoring' | 'Petugas' | 'Guest';
export type UserStatus = 'active' | 'pending';

export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  deviceId?: string;
}
