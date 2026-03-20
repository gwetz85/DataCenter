import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User as FirebaseUser
} from 'firebase/auth';
import { 
  ref, 
  set, 
  update, 
  onValue 
} from 'firebase/database';
import { auth, db } from '../config/firebase';
import type { User, Role, UserStatus } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUserRole: (userId: string, newRole: Role, newStatus: UserStatus) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Sync the Users collection from Realtime Database real-time
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData: User[] = [];
      const data = snapshot.val();
      if (data) {
        Object.keys(data).forEach((uid) => {
          usersData.push({ id: uid, ...data[uid] } as User);
        });
      }
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  // 2. Sync Current User from Firebase Auth & cross-reference with 'users' state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // We need to wait for `users` to populate or fetch the doc directly.
        // For robustness, let's just find them in the `users` array if it exists.
        // Note: There's a slight race condition here if users array isn't loaded yet.
        const foundUser = users.find(u => u.id === firebaseUser.uid);
        if (foundUser) {
          setCurrentUser(foundUser);
        } else {
          // If not in array yet, wait for the next render when `users` updates
          // or we could fetch the specific doc securely.
          setCurrentUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: 'Loading...',
            role: 'Guest',
            status: 'pending'
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [users]); // Re-run when users array changes so currentUser grabs its real profile data

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: 'Email atau password salah.' };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const userUid = userCredential.user.uid;

      const newUser: Omit<User, 'id'> = {
        name,
        email,
        role: 'Guest',
        status: 'pending'
      };

      // Create their profile in the Realtime Database
      await set(ref(db, `users/${userUid}`), newUser);

      // Sign them out immediately? Or leave them signed in but status='pending'
      // If they are signed in but pending, the ProtectedRoute will handle it.
      await signOut(auth);

      return { success: true, message: 'Pendaftaran berhasil. Silakan tunggu persetujuan Admin.' };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: 'Pendaftaran gagal atau email sudah digunakan.' };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserRole = async (userId: string, newRole: Role, newStatus: UserStatus) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      await update(userRef, {
        role: newRole,
        status: newStatus
      });
    } catch (err) {
      console.error("Error updating user role: ", err);
    }
  };

  const changePassword = async (oldPass: string, newPass: string) => {
    if (!auth.currentUser || !auth.currentUser.email) return { success: false, message: 'Tidak ada sesi aktif.' };
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPass);
      return { success: true, message: 'Kata sandi berhasil diubah.' };
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        return { success: false, message: 'Kata sandi lama salah.' };
      }
      return { success: false, message: 'Gagal mengubah kata sandi.' };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, loading, login, register, logout, updateUserRole, changePassword }}>
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
