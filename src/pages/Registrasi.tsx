import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { ref, push, set } from 'firebase/database';
import { FileText, Send, AlertCircle, CheckCircle2, Printer } from 'lucide-react';

export default function Registrasi() {
  const { currentUser } = useAuth();
  
  // Common Fields
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [nik, setNik] = useState('');
  const [nomorKk, setNomorKk] = useState('');
  const [nomorPonsel, setNomorPonsel] = useState('');
  const [alamat, setAlamat] = useState('');
  const [jenisLayanan, setJenisLayanan] = useState('');
  
  // Conditional: NIB
  const [namaUsaha, setNamaUsaha] = useState('');
  const [lokasiUsaha, setLokasiUsaha] = useState('');
  const [jenisUsaha, setJenisUsaha] = useState('');
  const [modalUsaha, setModalUsaha] = useState('');
  const [lamaUsaha, setLamaUsaha] = useState('');

  // Conditional: Halal
  const [namaProduk, setNamaProduk] = useState('');
  const [lokasiPabrik, setLokasiPabrik] = useState('');
  const [bahanDigunakan, setBahanDigunakan] = useState('');
  const [bahanPembersih, setBahanPembersih] = useState('');
  const [bahanKemasan, setBahanKemasan] = useState('');
  const [tataCaraPembuatan, setTataCaraPembuatan] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setNama(''); setJenisKelamin(''); setNik(''); setNomorKk(''); setNomorPonsel(''); setAlamat(''); setJenisLayanan('');
    setNamaUsaha(''); setLokasiUsaha(''); setJenisUsaha(''); setModalUsaha(''); setLamaUsaha('');
    setNamaProduk(''); setLokasiPabrik(''); setBahanDigunakan(''); setBahanPembersih(''); setBahanKemasan(''); setTataCaraPembuatan('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    // Basic Validation for common fields
    if (!nama || !jenisKelamin || !nik || !nomorKk || !nomorPonsel || !alamat || !jenisLayanan) {
      setStatus({ type: 'error', msg: 'Mohon isi semua data diri dan pilih jenis layanan.' });
      return;
    }

    if (jenisLayanan === 'Pembuatan NIB') {
      if (!namaUsaha || !lokasiUsaha || !jenisUsaha || !modalUsaha || !lamaUsaha) {
        setStatus({ type: 'error', msg: 'Mohon isi semua detail usaha untuk NIB.' });
        return;
      }
    }

    if (jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )') {
      if (!namaUsaha || !lokasiUsaha || !jenisUsaha || !modalUsaha || !lamaUsaha) {
        setStatus({ type: 'error', msg: 'Mohon isi semua detail usaha (Data NIB) untuk Sertifikat Halal.' });
        return;
      }
      if (!namaProduk || !lokasiPabrik || !bahanDigunakan || !bahanPembersih || !bahanKemasan || !tataCaraPembuatan) {
        setStatus({ type: 'error', msg: 'Mohon isi semua detail produk & bahan untuk Sertifikat Halal.' });
        return;
      }
    }

    if (!currentUser) {
      setStatus({ type: 'error', msg: 'Sesi Anda tidak valid. Silakan login ulang.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const newPengajuanRef = push(ref(db, 'pengajuan'));
      
      const baseData = {
        id: newPengajuanRef.key,
        nama,
        jenisKelamin,
        nik,
        nomorKk,
        nomorPonsel,
        alamat,
        jenisLayanan,
        status: 'Registrasi', 
        createdAt: new Date().getTime(),
        createdBy: currentUser.id,
        authorName: currentUser.name
      };

      let extendedData = {};
      
      if (jenisLayanan === 'Pembuatan NIB') {
        extendedData = { namaUsaha, lokasiUsaha, jenisUsaha, modalUsaha, lamaUsaha };
      } else if (jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )') {
        extendedData = { 
          namaUsaha, lokasiUsaha, jenisUsaha, modalUsaha, lamaUsaha,
          namaProduk, lokasiPabrik, bahanDigunakan, bahanPembersih, bahanKemasan, tataCaraPembuatan 
        };
      }

      await set(newPengajuanRef, { ...baseData, ...extendedData });
      
      setStatus({ type: 'success', msg: 'Data berhasil diregistrasikan!' });
      resetForm();
      
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Gagal mengirim data ke server.' });
    }

    setIsSubmitting(false);
  };

  const inputStyle = { padding: '1rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-main)', outline: 'none', fontSize: '0.95rem', width: '100%' };
  const labelStyle = { fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'block' };
  const fieldGroupStyle = { marginBottom: '1.25rem' };
  const sectionTitleStyle = { fontSize: '1.2rem', fontWeight: 800, margin: '2rem 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.05)' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex' }}>
            <FileText size={32} />
          </div>
          Registrasi Pengajuan
        </h1>
        <button 
          onClick={handlePrint}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 700 }}
        >
          <Printer size={18} /> Cetak Form
        </button>
      </div>

      <p className="no-print" style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontWeight: 500 }}>
        Silakan isi data diri pemohon dan pilih jenis layanan rekapitulasi.
      </p>

      {status && (
        <div className="no-print" style={{ 
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

      <div className="glass-card animate-enter printable-form" ref={formRef} style={{ padding: '2.5rem' }}>
        <form onSubmit={handleSubmit}>
          
          <h2 style={{...sectionTitleStyle, marginTop: 0}}>Data Diri Pemohon</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Nama Lengkap *</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Jenis Kelamin *</label>
              <select value={jenisKelamin} onChange={e => setJenisKelamin(e.target.value)} style={{...inputStyle, appearance: 'none', cursor: 'pointer'}} required>
                <option value="" disabled style={{ color: 'black' }}>Pilih...</option>
                <option value="Laki-laki" style={{ color: 'black' }}>Laki-laki</option>
                <option value="Perempuan" style={{ color: 'black' }}>Perempuan</option>
              </select>
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>NIK KTP *</label>
              <input type="number" value={nik} onChange={e => setNik(e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Nomor KK *</label>
              <input type="number" value={nomorKk} onChange={e => setNomorKk(e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Nomor Ponsel (WhatsApp) *</label>
              <input type="tel" value={nomorPonsel} onChange={e => setNomorPonsel(e.target.value)} style={inputStyle} required />
            </div>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Alamat Lengkap *</label>
            <textarea value={alamat} onChange={e => setAlamat(e.target.value)} rows={3} style={{...inputStyle, resize: 'vertical'}} required />
          </div>

          <h2 style={sectionTitleStyle}>Layanan & Perizinan</h2>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Pilihan Pengerjaan *</label>
            <select value={jenisLayanan} onChange={e => setJenisLayanan(e.target.value)} style={{...inputStyle, appearance: 'none', cursor: 'pointer', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.3)'}} required>
              <option value="" disabled style={{ color: 'black' }}>Pilih Jenis Pengerjaan</option>
              <option value="Pembuatan NIB" style={{ color: 'black' }}>Pembuatan NIB</option>
              <option value="Pembuatan Sertifikat Halal ( Selfdeclare )" style={{ color: 'black' }}>Pembuatan Sertifikat Halal ( Selfdeclare )</option>
              <option value="BPJS Ketenagakerjaan" style={{ color: 'black' }}>BPJS Ketenagakerjaan</option>
              <option value="BPJS PBU APBN" style={{ color: 'black' }}>BPJS PBU APBN</option>
            </select>
          </div>

          {/* Dinamis: Formulir NIB */}
          {(jenisLayanan === 'Pembuatan NIB' || jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )') && (
            <div className="animate-enter" style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '16px', marginTop: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#10b981' }}>Detail Usaha (Data NIB)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Nama Usaha *</label>
                  <input type="text" value={namaUsaha} onChange={e => setNamaUsaha(e.target.value)} style={inputStyle} required />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Jenis Usaha *</label>
                  <select value={jenisUsaha} onChange={e => setJenisUsaha(e.target.value)} style={{...inputStyle, appearance: 'none'}} required>
                    <option value="" disabled style={{ color: 'black' }}>Pilih...</option>
                    <option value="Kuliner" style={{ color: 'black' }}>Kuliner</option>
                    <option value="Tidak Kuliner" style={{ color: 'black' }}>Tidak Kuliner</option>
                  </select>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Modal Usaha (Rp) *</label>
                  <input type="number" value={modalUsaha} onChange={e => setModalUsaha(e.target.value)} style={inputStyle} required />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Lama Usaha *</label>
                  <input type="text" value={lamaUsaha} onChange={e => setLamaUsaha(e.target.value)} placeholder="Misal: 2 Tahun" style={inputStyle} required />
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Lokasi Usaha *</label>
                <textarea value={lokasiUsaha} onChange={e => setLokasiUsaha(e.target.value)} rows={2} style={{...inputStyle, resize: 'vertical'}} required />
              </div>
            </div>
          )}

          {/* Dinamis: Formulir Halal */}
          {jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )' && (
            <div className="animate-enter" style={{ background: 'rgba(0,0,0,0.1)', padding: '1.5rem', borderRadius: '16px', marginTop: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#0ea5e9' }}>Detail Produk & Bahan (Khusus Halal)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Nama Produk *</label>
                  <input type="text" value={namaProduk} onChange={e => setNamaProduk(e.target.value)} style={inputStyle} required />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Lokasi Pabrik / Dapur *</label>
                  <input type="text" value={lokasiPabrik} onChange={e => setLokasiPabrik(e.target.value)} style={inputStyle} required />
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Bahan Yang Digunakan (Sebutkan 10 Item) *</label>
                <textarea value={bahanDigunakan} onChange={e => setBahanDigunakan(e.target.value)} rows={3} placeholder="1. Terigu, 2. Gula, 3. Air..." style={{...inputStyle, resize: 'vertical'}} required />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Bahan Pembersih (Sebutkan 5 Item) *</label>
                <textarea value={bahanPembersih} onChange={e => setBahanPembersih(e.target.value)} rows={2} placeholder="1. Sabun Cuci Piring..." style={{...inputStyle, resize: 'vertical'}} required />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Bahan Kemasan (Sebutkan 5 Item) *</label>
                <textarea value={bahanKemasan} onChange={e => setBahanKemasan(e.target.value)} rows={2} placeholder="1. Plastik Klip, 2. Kertas Minyak..." style={{...inputStyle, resize: 'vertical'}} required />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Tata Cara Pembuatan (Lengkap) *</label>
                <textarea value={tataCaraPembuatan} onChange={e => setTataCaraPembuatan(e.target.value)} rows={4} placeholder="Langkah-langkah pembuatan produk dari awal hingga akhir..." style={{...inputStyle, resize: 'vertical'}} required />
              </div>
            </div>
          )}

          <div className="no-print">
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{
                marginTop: '2rem', padding: '1.125rem', borderRadius: '16px', width: '100%',
                background: 'var(--primary)', color: 'white', fontWeight: 800, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, transition: 'all 0.3s',
                boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
                fontSize: '1.1rem'
              }}
            >
              <Send size={20} />
              {isSubmitting ? 'Memproses Data...' : 'Ajukan Data Pendaftaran'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
