import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, UserCheck } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!name || !username || !password) {
      setError('Mohon isi semua data.');
      return;
    }

    const dummyEmail = `${username.toLowerCase().replace(/\s+/g, '')}@datacenter.com`;

    // We pass the dummyEmail but in AuthContext we'll use `name` and `dummyEmail`.
    // We already decided to show Username instead of Email. We can just use dummyEmail.
    const { success, message } = await register(name, dummyEmail, password);
    if (success) {
      setSuccessMsg(message || 'Pendaftaran berhasil!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setError('Username mungkin sudah terdaftar, silakan pilih yang lain.');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-card animate-enter" style={{ width: '100%', maxWidth: '440px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}>
             <UserPlus size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0 }}>Buat Akun</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem', fontWeight: 500 }}>Daftarkan diri Anda untuk akses</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '14px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
            <UserCheck size={20} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Nama Lengkap</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              style={{ minHeight: '48px', padding: '0.875rem 1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: Budi123"
              style={{ minHeight: '48px', padding: '0.875rem 1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ minHeight: '48px', padding: '0.875rem 1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          
          <button type="submit" className="primary-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', padding: '1rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 700 }}>
            <UserPlus size={20} /> Daftar Sekarang
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700 }}>Login di sini</Link>
        </p>
      </div>
    </div>
  );
}
