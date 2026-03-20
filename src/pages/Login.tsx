import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Mohon isi username dan password.');
      return;
    }

    // Allow user to just type 'AGUS' instead of full email
    // Map Username to a dummy email for Firebase Auth
    const loginEmail = username.includes('@') ? username : `${username.toLowerCase().replace(/\s+/g, '')}@datacenter.com`;

    const { success, message } = await login(loginEmail, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError(message || 'Login gagal.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', padding: '1rem' }}>
      <div className="glass-card animate-enter" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '0.5rem', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}>
            <Database size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>Selamat Datang</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>Silakan login ke Data Centre Database</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: AGUS"
              style={{ padding: '0.875rem 1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ padding: '0.875rem 1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          
          <button type="submit" className="primary-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', padding: '1rem', borderRadius: '14px', fontSize: '1rem' }}>
            <LogIn size={20} /> Masuk
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Belum punya akun? <Link to="/daftar" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
