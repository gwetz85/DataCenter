import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { ref, push, set } from 'firebase/database';
import { FileText, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Registrasi() {
  const { currentUser } = useAuth();
  
  const [namaPekerjaan, setNamaPekerjaan] = useState('');
  const [jenisLayanan, setJenisLayanan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    // Basic Validation
    if (!namaPekerjaan || !jenisLayanan || !deskripsi) {
      setStatus({ type: 'error', msg: 'Mohon isi semua bidang yang wajib (*)' });
      return;
    }

    if (!currentUser) {
      setStatus({ type: 'error', msg: 'Sesi Anda tidak valid. Silakan login ulang.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a unique reference under 'pengajuan'
      const newPengajuanRef = push(ref(db, 'pengajuan'));
      
      const newData = {
        id: newPengajuanRef.key,
        namaPekerjaan,
        jenisLayanan,
        deskripsi,
        status: 'Registrasi', // Initial status
        createdAt: new Date().getTime(),
        createdBy: currentUser.id,
        authorName: currentUser.name
      };

      await set(newPengajuanRef, newData);
      
      setStatus({ type: 'success', msg: 'Data berhasil diregistrasikan!' });
      
      // Reset form
      setNamaPekerjaan('');
      setJenisLayanan('');
      setDeskripsi('');
      
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Gagal mengirim data ke server.' });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="page-content-wrapper">
      <div className="page-content">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="stat-icon" style={{ background: 'var(--primary)', color: 'white' }}>
            <FileText size={24} />
          </div>
          Registrasi Pengajuan
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Formulir untuk mengajukan data pekerjaan atau layanan baru ke dalam sistem.
        </p>

        <div className="glass-card animate-enter" style={{ padding: '2rem', maxWidth: '800px' }}>
          
          {status && (
            <div style={{ 
              padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: status.type === 'error' ? '#ef4444' : '#10b981',
              border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
            }}>
              {status.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Nama Pekerjaan / Proyek *</label>
              <input 
                type="text" 
                value={namaPekerjaan}
                onChange={(e) => setNamaPekerjaan(e.target.value)}
                placeholder="Contoh: Perbaikan Jaringan Server A"
                style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', minHeight: '44px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Jenis Layanan *</label>
              <select 
                value={jenisLayanan}
                onChange={(e) => setJenisLayanan(e.target.value)}
                style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', minHeight: '48px', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled style={{ color: 'black' }}>Pilih Jenis Layanan</option>
                <option value="Instalasi Perangkat" style={{ color: 'black' }}>Instalasi Perangkat</option>
                <option value="Maintenance Rutin" style={{ color: 'black' }}>Maintenance Rutin</option>
                <option value="Troubleshooting Jaringan" style={{ color: 'black' }}>Troubleshooting Jaringan</option>
                <option value="Update Software / OS" style={{ color: 'black' }}>Update Software / OS</option>
                <option value="Lainnya" style={{ color: 'black' }}>Lainnya</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Deskripsi Detail *</label>
              <textarea 
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Jelaskan kendala, tujuan, atau catatan penting terkait pengajuan ini..."
                rows={4}
                style={{ padding: '0.875rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                marginTop: '1rem', padding: '1rem', borderRadius: '10px',
                background: 'var(--primary)', color: 'white', fontWeight: 600, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.2s'
              }}
            >
              <Send size={20} />
              {isSubmitting ? 'Menyimpan...' : 'Ajukan Data Sekarang'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
