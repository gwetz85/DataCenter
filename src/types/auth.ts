export type Role = 'Admin' | 'Verifikator' | 'Monitoring' | 'Petugas' | 'Guest';
export type UserStatus = 'active' | 'pending';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Keep simple for mocking purposes
  role: Role;
  status: UserStatus;
}
