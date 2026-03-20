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
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: 800 }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex' }}>
          <FileText size={32} />
        </div>
        Registrasi Pengajuan
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 500 }}>
        Formulir untuk mengajukan data pekerjaan atau layanan baru ke dalam sistem.
      </p>

      <div className="glass-card animate-enter" style={{ padding: '2.5rem' }}>
        
        {status && (
          <div style={{ 
            padding: '1rem 1.25rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            color: status.type === 'error' ? '#ef4444' : '#10b981',
            border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            fontWeight: 600
          }}>
            {status.type === 'error' ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Nama Pekerjaan / Proyek *</label>
            <input 
              type="text" 
              value={namaPekerjaan}
              onChange={(e) => setNamaPekerjaan(e.target.value)}
              placeholder="Contoh: Perbaikan Jaringan Server A"
              style={{ padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Jenis Layanan *</label>
            <select 
              value={jenisLayanan}
              onChange={(e) => setJenisLayanan(e.target.value)}
              style={{ padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none', appearance: 'none', cursor: 'pointer', fontSize: '1rem' }}
            >
              <option value="" disabled style={{ color: 'black' }}>Pilih Jenis Layanan</option>
              <option value="Instalasi Perangkat" style={{ color: 'black' }}>Instalasi Perangkat</option>
              <option value="Maintenance Rutin" style={{ color: 'black' }}>Maintenance Rutin</option>
              <option value="Troubleshooting Jaringan" style={{ color: 'black' }}>Troubleshooting Jaringan</option>
              <option value="Update Software / OS" style={{ color: 'black' }}>Update Software / OS</option>
              <option value="Lainnya" style={{ color: 'black' }}>Lainnya</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Deskripsi Detail *</label>
            <textarea 
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan kendala, tujuan, atau catatan penting terkait pengajuan ini..."
              rows={4}
              style={{ padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none', resize: 'vertical', fontSize: '1rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              marginTop: '1.5rem', padding: '1.125rem', borderRadius: '16px',
              background: 'var(--primary)', color: 'white', fontWeight: 700, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.3s',
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
              fontSize: '1rem'
            }}
          >
            <Send size={20} />
            {isSubmitting ? 'Menyimpan...' : 'Ajukan Data Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
