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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: 800 }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex' }}>
          <Palette size={32} />
        </div>
        Pengaturan Aplikasi
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 500 }}>
        Sesuaikan tema, warna, dan keamanan akun Anda untuk pengalaman terbaik.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* TEMA APLIKASI */}
        <div className="glass-card animate-enter" style={{ padding: '2.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', fontWeight: 800 }}>
            <Sun size={24} color="var(--secondary)" /> Mode Tampilan (Tema)
          </h2>
          <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Pilih mode tampilan gelap atau terang sesuai dengan kenyamanan mata Anda.</p>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setTheme('light')}
              style={{
                flex: 1, minWidth: '150px', padding: '1.5rem', borderRadius: '20px',
                background: theme === 'light' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: theme === 'light' ? 'white' : 'var(--text-main)',
                border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                cursor: 'pointer', transition: 'all 0.3s', boxShadow: theme === 'light' ? '0 10px 15px -3px rgba(79, 70, 229, 0.4)' : 'none'
              }}
            >
              <Sun size={32} />
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Mode Terang</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              style={{
                flex: 1, minWidth: '150px', padding: '1.5rem', borderRadius: '20px',
                background: theme === 'dark' ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                color: theme === 'dark' ? 'white' : 'var(--text-main)',
                border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                cursor: 'pointer', transition: 'all 0.3s', boxShadow: theme === 'dark' ? '0 10px 15px -3px rgba(79, 70, 229, 0.4)' : 'none'
              }}
            >
              <Moon size={32} />
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Mode Gelap</span>
            </button>
          </div>
        </div>

        {/* PALET WARNA */}
        <div className="glass-card animate-enter" style={{ padding: '2.5rem', animationDelay: '0.1s' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', fontWeight: 800 }}>
            <Palette size={24} color="var(--primary)" /> Palet Warna Dasar
          </h2>
          <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Ubah warna dominan aplikasi ke warna favorit Anda.</p>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: c.hex, cursor: 'pointer',
                  border: color === c.id ? `4px solid ${theme === 'dark' ? '#fff' : '#0f172a'}` : '2px solid transparent',
                  boxShadow: color === c.id ? `0 0 20px ${c.hex}` : 'none',
                  transition: 'all 0.3s',
                  transform: color === c.id ? 'scale(1.1)' : 'scale(1)'
                }}
                title={`Warna ${c.name}`}
              />
            ))}
          </div>
        </div>

        {/* UBAH KATA SANDI */}
        <div className="glass-card animate-enter" style={{ padding: '2.5rem', animationDelay: '0.2s' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', fontWeight: 800 }}>
            <Lock size={24} color="var(--secondary)" /> Ubah Kata Sandi
          </h2>
          <p style={{ marginBottom: '1.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Ganti kata sandi utama untuk login (Minimal 6 karakter).</p>
          
          {passStatus && (
            <div style={{ 
              padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: passStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: passStatus.type === 'error' ? '#ef4444' : '#10b981',
              border: `1px solid ${passStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
              fontWeight: 600
            }}>
              {passStatus.type === 'error' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
              {passStatus.msg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Kata Sandi Saat Ini</label>
              <input 
                type="password" 
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                style={{ padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Kata Sandi Baru</label>
              <input 
                type="password" 
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimal 6 karakter"
                style={{ padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isChangingPass}
              style={{
                marginTop: '1rem', padding: '1.125rem', borderRadius: '16px',
                background: 'var(--secondary)', color: 'white', fontWeight: 700, border: 'none',
                cursor: isChangingPass ? 'not-allowed' : 'pointer', opacity: isChangingPass ? 0.7 : 1, transition: 'all 0.3s',
                boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.4)'
              }}
            >
              {isChangingPass ? 'Memproses...' : 'Simpan Kata Sandi'}
            </button>
          </form>
        </div>

        {/* ADMIN STRICT ZONE (RESET COUNTER) */}
        {currentUser?.role === 'Admin' && (
          <div className="glass-card animate-enter" style={{ padding: '2.5rem', animationDelay: '0.3s', border: '2px dashed #ef4444' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>
              <ShieldAlert size={26} /> Zona Bahaya (Khusus Admin)
            </h2>
            <p style={{ marginBottom: '1.75rem', color: '#fca5a5', fontWeight: 500 }}>
              Reset semua counter di Halaman Dashboard menjadi 0. <strong>Tindakan ini tidak bisa dibatalkan!</strong>
            </p>
            
            {resetStatus && (
              <div style={{ 
                padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                background: resetStatus.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                color: resetStatus.type === 'error' ? '#ef4444' : '#10b981',
                border: `1px solid ${resetStatus.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                fontWeight: 600
              }}>
                {resetStatus.type === 'error' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                {resetStatus.msg}
              </div>
            )}

            <form onSubmit={handleResetDashboard} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Menyetujui Reset</label>
                <input 
                  type="text" 
                  value={resetCommand}
                  onChange={(e) => setResetCommand(e.target.value)}
                  placeholder="Ketik: Reset"
                  style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.5)', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--text-main)', outline: 'none' }}
                />
              </div>
              <button 
                type="submit" 
                disabled={isResetting || resetCommand !== 'Reset'}
                style={{
                  marginTop: '0.5rem', padding: '1.125rem', borderRadius: '16px',
                  background: '#ef4444', color: 'white', fontWeight: 800, border: 'none',
                  cursor: (isResetting || resetCommand !== 'Reset') ? 'not-allowed' : 'pointer', 
                  opacity: (isResetting || resetCommand !== 'Reset') ? 0.5 : 1, transition: 'all 0.3s',
                  boxShadow: resetCommand === 'Reset' ? '0 10px 15px -3px rgba(239, 68, 68, 0.4)' : 'none'
                }}
              >
                {isResetting ? 'Mereset Database...' : 'Saya Yakin, Reset Dashboard!'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
