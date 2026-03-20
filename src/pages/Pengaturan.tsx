import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, type ColorPalette } from '../context/ThemeContext';
import { Palette, Moon, Sun, Lock, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { db } from '../config/firebase';

const COLOR_OPTIONS: { id: ColorPalette; name: string; hex: string }[] = [
  { id: 'biru', name: 'Biru', hex: '#4F46E5' },
  { id: 'merah', name: 'Merah', hex: '#ef4444' },
  { id: 'oren', name: 'Oren', hex: '#f97316' },
  { id: 'kuning', name: 'Kuning', hex: '#eab308' },
  { id: 'jingga', name: 'Jingga', hex: '#8b5cf6' },
  { id: 'hijau', name: 'Hijau', hex: '#10b981' },
];

export default function Pengaturan() {
  const { currentUser, changePassword } = useAuth();
  const { theme, setTheme, color, setColor } = useTheme();

  // Password State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passStatus, setPassStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Admin Reset State
  const [resetCommand, setResetCommand] = useState('');
  const [resetStatus, setResetStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus(null);
    if (!oldPass || !newPass) {
      setPassStatus({ type: 'error', msg: 'Mohon isi kedua kata sandi.' });
      return;
    }
    if (newPass.length < 6) {
      setPassStatus({ type: 'error', msg: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }

    setIsChangingPass(true);
    const { success, message } = await changePassword(oldPass, newPass);
    setIsChangingPass(false);

    if (success) {
      setPassStatus({ type: 'success', msg: message || 'Kata sandi berhasil diubah.' });
      setOldPass('');
      setNewPass('');
    } else {
      setPassStatus({ type: 'error', msg: message || 'Gagal mengubah kata sandi.' });
    }
  };

  const handleResetDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    
    if (resetCommand !== 'Reset') {
      setResetStatus({ type: 'error', msg: 'Ketik "Reset" dengan huruf R besar untuk melanjutkan.' });
      return;
    }

    setIsResetting(true);
    try {
      // Logic to reset the dashboard counters. 
      // Replace 'stats' with the actual database node you use for dashboard metrics.
      await set(ref(db, 'dashboard_stats'), {
        registrasi: 0,
        verifikasi: 0,
        pengajuan: 0,
        validasi: 0,
        selesai: 0,
        ditolak: 0
      });
      setResetStatus({ type: 'success', msg: 'Counter Dashboard berhasil di-reset menjadi 0!' });
      setResetCommand('');
    } catch (err) {
      console.error(err);
      setResetStatus({ type: 'error', msg: 'Terjadi kesalahan saat mereset database.' });
    }
    setIsResetting(false);
  };

  return (
    <div className="page-content-wrapper">
      <div className="page-content">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Palette className="stat-icon" style={{ background: 'var(--primary)', color: 'white' }} size={32} />
          Pengaturan Aplikasi
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '800px' }}>
          
          {/* TEMA APLIKASI */}
          <div className="glass-card animate-enter" style={{ padding: '2rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
              <Sun size={24} /> Mode Tampilan (Tema)
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>Pilih mode tampilan gelap atau terang sesuai dengan kenyamanan mata Anda.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setTheme('light')}
                style={{
                  flex: 1, minWidth: '150px', padding: '1rem', borderRadius: '12px',
                  background: theme === 'light' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: theme === 'light' ? 'white' : 'var(--text-main)',
                  border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Sun size={28} />
                <span style={{ fontWeight: 600 }}>Mode Terang</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  flex: 1, minWidth: '150px', padding: '1rem', borderRadius: '12px',
                  background: theme === 'dark' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: theme === 'dark' ? 'white' : 'var(--text-main)',
                  border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Moon size={28} />
                <span style={{ fontWeight: 600 }}>Mode Gelap</span>
              </button>
            </div>
          </div>

          {/* PALET WARNA */}
          <div className="glass-card animate-enter" style={{ padding: '2rem', animationDelay: '0.1s' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
              <Palette size={24} /> Palet Warna Dasar
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>Ubah warna dominan aplikasi ke warna favorit Anda.</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: c.hex, cursor: 'pointer',
                    border: color === c.id ? '4px solid white' : '2px solid transparent',
                    boxShadow: color === c.id ? `0 0 15px ${c.hex}` : 'none',
                    transition: 'all 0.2s'
                  }}
                  title={`Warna ${c.name}`}
                />
              ))}
            </div>
          </div>

          {/* UBAH KATA SANDI */}
          <div className="glass-card animate-enter" style={{ padding: '2rem', animationDelay: '0.2s' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
              <Lock size={24} /> Ubah Kata Sandi
            </h2>
            <p style={{ marginBottom: '1.5rem' }}>Ganti kata sandi utama untuk login (Minimal 6 karakter).</p>
            
            {passStatus && (
              <div style={{ 
                padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: passStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: passStatus.type === 'error' ? '#ef4444' : '#10b981',
                border: `1px solid ${passStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
              }}>
                {passStatus.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                {passStatus.msg}
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Kata Sandi Saat Ini</label>
                <input 
                  type="password" 
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Kata Sandi Baru</label>
                <input 
                  type="password" 
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={isChangingPass}
                style={{
                  marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px',
                  background: 'var(--secondary)', color: 'white', fontWeight: 600, border: 'none',
                  cursor: isChangingPass ? 'not-allowed' : 'pointer', opacity: isChangingPass ? 0.7 : 1
                }}
              >
                {isChangingPass ? 'Memproses...' : 'Simpan Kata Sandi'}
              </button>
            </form>
          </div>

          {/* ADMIN STRICT ZONE (RESET COUNTER) */}
          {currentUser?.role === 'Admin' && (
            <div className="glass-card animate-enter" style={{ padding: '2rem', animationDelay: '0.3s', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', color: '#ef4444' }}>
                <ShieldAlert size={24} /> Zona Bahaya (Khusus Admin)
              </h2>
              <p style={{ marginBottom: '1.5rem', color: '#fca5a5' }}>
                Reset semua counter di Halaman Dashboard menjadi 0. <strong>Tindakan ini tidak bisa dibatalkan!</strong>
              </p>
              
              {resetStatus && (
                <div style={{ 
                  padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: resetStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: resetStatus.type === 'error' ? '#ef4444' : '#10b981',
                  border: `1px solid ${resetStatus.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                }}>
                  {resetStatus.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  {resetStatus.msg}
                </div>
              )}

              <form onSubmit={handleResetDashboard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>Menyetujui Reset</label>
                  <input 
                    type="text" 
                    value={resetCommand}
                    onChange={(e) => setResetCommand(e.target.value)}
                    placeholder="Ketik: Reset"
                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.05)', color: 'white', outline: 'none' }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isResetting || resetCommand !== 'Reset'}
                  style={{
                    marginTop: '0.5rem', padding: '0.75rem', borderRadius: '8px',
                    background: '#ef4444', color: 'white', fontWeight: 600, border: 'none',
                    cursor: (isResetting || resetCommand !== 'Reset') ? 'not-allowed' : 'pointer', 
                    opacity: (isResetting || resetCommand !== 'Reset') ? 0.5 : 1
                  }}
                >
                  {isResetting ? 'Mereset Database...' : 'Saya Yakin, Reset Dashboard!'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
