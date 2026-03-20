export type Role = 'Admin' | 'Verifikator' | 'Monitoring' | 'Petugas';

export interface User {
  name: string;
  role: Role;
}
