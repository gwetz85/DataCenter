import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, Role } from '../types/auth';

interface AuthContextType {
  user: User;
  switchRole: (role: Role) => void;
}

const mockUsers: Record<Role, User> = {
  Admin: { name: 'Super Admin', role: 'Admin' },
  Verifikator: { name: 'Tim Verifikasi', role: 'Verifikator' },
  Monitoring: { name: 'Pemantau', role: 'Monitoring' },
  Petugas: { name: 'Petugas Lapangan', role: 'Petugas' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to Admin for now
  const [user, setUser] = useState<User>(mockUsers.Admin);

  const switchRole = (role: Role) => {
    setUser(mockUsers[role]);
  };

  return (
    <AuthContext.Provider value={{ user, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
