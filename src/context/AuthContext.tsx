import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Role, UserStatus } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, pass: string) => { success: boolean; message?: string };
  register: (name: string, email: string, pass: string) => { success: boolean; message?: string };
  logout: () => void;
  updateUserRole: (userId: string, newRole: Role, newStatus: UserStatus) => void;
}

const defaultAdmin: User = {
  id: 'usr-admin-1',
  name: 'Super Admin',
  email: 'admin@datacenter.com',
  password: 'admin',
  role: 'Admin',
  status: 'active'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use localStorage or persist mock memory
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dc_users');
    return saved ? JSON.parse(saved) : [defaultAdmin];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dc_current_user');
    return saved ? JSON.parse(saved) : null; // Start logged out
  });

  // Sync basic states to local storage
  useEffect(() => {
    localStorage.setItem('dc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dc_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dc_current_user');
    }
  }, [currentUser]);

  const login = (email: string, pass: string) => {
    const foundUser = users.find(u => u.email === email && u.password === pass);
    if (!foundUser) {
      return { success: false, message: 'Email atau password salah' };
    }
    if (foundUser.status === 'pending') {
      return { success: false, message: 'Akun Anda sedang menunggu persetujuan Admin.' };
    }
    
    setCurrentUser(foundUser);
    return { success: true };
  };

  const register = (name: string, email: string, pass: string) => {
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email sudah terdaftar' };
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      password: pass,
      role: 'Guest',
      status: 'pending'
    };
    setUsers(prev => [...prev, newUser]);
    return { success: true, message: 'Pendaftaran berhasil. Silakan tunggu persetujuan Admin.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateUserRole = (userId: string, newRole: Role, newStatus: UserStatus) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole, status: newStatus };
      }
      return u;
    }));
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateUserRole }}>
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
