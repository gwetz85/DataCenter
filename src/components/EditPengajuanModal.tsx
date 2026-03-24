import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, update } from 'firebase/database';
import { X, Save } from 'lucide-react';

interface EditPengajuanModalProps {
  data: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditPengajuanModal({ data, onClose, onSuccess }: EditPengajuanModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updateData = { ...formData };
      delete updateData.id; // don't update ID
      
      await update(ref(db, `pengajuan/${data.id}`), updateData);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = { 
    padding: '0.75rem', 
    borderRadius: '10px', 
    border: '1px solid rgba(255,255,255,0.1)', 
    background: 'rgba(0,0,0,0.2)', 
    color: 'var(--text-main)', 
    outline: 'none', 
    fontSize: '0.9rem', 
    width: '100%',
  };
  const labelStyle = { fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' };
  const fieldGroupStyle = { marginBottom: '1rem' };
  const sectionTitleStyle = { fontSize: '1.1rem', fontWeight: 800, margin: '1.5rem 0 1rem 0', color: 'var(--primary)', textTransform: 'uppercase' as const, letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' };

  if (!data) return null;

  const jenisLayanan = formData.jenisLayanan || '';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.7)', zIndex: 1000, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card animate-enter" style={{ 
        width: '100%', maxWidth: '800px', maxHeight: '90vh', 
        overflowY: 'auto', padding: '2rem', position: 'relative',
        background: '#1e293b' // solid background to avoid transparency issues
      }}>
        
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-main)', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', display: 'flex' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 800 }}>Edit Data Pengajuan</h2>

        <form onSubmit={handleSubmit}>
          
          <h3 style={{...sectionTitleStyle, marginTop: 0}}>Data Diri Pemohon</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Nama Lengkap</label>
              <input type="text" value={formData.nama || ''} onChange={e => handleChange('nama', e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Jenis Kelamin</label>
              <select value={formData.jenisKelamin || ''} onChange={e => handleChange('jenisKelamin', e.target.value)} style={{...inputStyle, appearance: 'none'}} required>
                <option value="" disabled style={{ color: 'black' }}>Pilih...</option>
                <option value="Laki-laki" style={{ color: 'black' }}>Laki-laki</option>
                <option value="Perempuan" style={{ color: 'black' }}>Perempuan</option>
              </select>
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>NIK KTP</label>
              <input type="number" value={formData.nik || ''} onChange={e => handleChange('nik', e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Nomor KK</label>
              <input type="number" value={formData.nomorKk || ''} onChange={e => handleChange('nomorKk', e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Tempat Lahir</label>
              <input type="text" value={formData.tempatLahir || ''} onChange={e => handleChange('tempatLahir', e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Tanggal Lahir</label>
              <input type="date" value={formData.tanggalLahir || ''} onChange={e => handleChange('tanggalLahir', e.target.value)} style={inputStyle} required />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Nomor Ponsel</label>
              <input type="tel" value={formData.nomorPonsel || ''} onChange={e => handleChange('nomorPonsel', e.target.value)} style={inputStyle} required />
            </div>
          </div>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Alamat Lengkap</label>
            <textarea value={formData.alamat || ''} onChange={e => handleChange('alamat', e.target.value)} rows={2} style={inputStyle} required />
          </div>

          <h3 style={sectionTitleStyle}>Layanan & Perizinan</h3>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Jenis Layanan</label>
            <select value={formData.jenisLayanan || ''} onChange={e => handleChange('jenisLayanan', e.target.value)} style={{...inputStyle, appearance: 'none'}} required>
              <option value="Pembuatan NIB" style={{ color: 'black' }}>Pembuatan NIB</option>
              <option value="Pembuatan Sertifikat Halal ( Selfdeclare )" style={{ color: 'black' }}>Pembuatan Sertifikat Halal ( Selfdeclare )</option>
              <option value="BPJS Ketenagakerjaan" style={{ color: 'black' }}>BPJS Ketenagakerjaan</option>
              <option value="BPJS PBU APBN" style={{ color: 'black' }}>BPJS PBU APBN</option>
            </select>
          </div>

          {(jenisLayanan === 'Pembuatan NIB' || jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )') && (
            <div>
              <h3 style={{ ...sectionTitleStyle, color: '#10b981' }}>Detail Usaha</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Nama Usaha</label>
                  <input type="text" value={formData.namaUsaha || ''} onChange={e => handleChange('namaUsaha', e.target.value)} style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Jenis Usaha</label>
                  <select value={formData.jenisUsaha || ''} onChange={e => handleChange('jenisUsaha', e.target.value)} style={{...inputStyle, appearance: 'none'}}>
                    <option value="" disabled style={{ color: 'black' }}>Pilih...</option>
                    <option value="Kuliner" style={{ color: 'black' }}>Kuliner</option>
                    <option value="Tidak Kuliner" style={{ color: 'black' }}>Tidak Kuliner</option>
                  </select>
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Modal Usaha (Rp)</label>
                  <input type="number" value={formData.modalUsaha || ''} onChange={e => handleChange('modalUsaha', e.target.value)} style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Lama Usaha</label>
                  <input type="text" value={formData.lamaUsaha || ''} onChange={e => handleChange('lamaUsaha', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Lokasi Usaha</label>
                <textarea value={formData.lokasiUsaha || ''} onChange={e => handleChange('lokasiUsaha', e.target.value)} rows={2} style={inputStyle} />
              </div>
            </div>
          )}

          {jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )' && (
            <div>
              <h3 style={{ ...sectionTitleStyle, color: '#0ea5e9' }}>Detail Produk & Bahan</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Nama Produk</label>
                  <input type="text" value={formData.namaProduk || ''} onChange={e => handleChange('namaProduk', e.target.value)} style={inputStyle} />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={labelStyle}>Lokasi Pabrik / Dapur</label>
                  <input type="text" value={formData.lokasiPabrik || ''} onChange={e => handleChange('lokasiPabrik', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Bahan Yang Digunakan</label>
                <textarea value={formData.bahanDigunakan || ''} onChange={e => handleChange('bahanDigunakan', e.target.value)} rows={2} style={inputStyle} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Bahan Pembersih</label>
                <textarea value={formData.bahanPembersih || ''} onChange={e => handleChange('bahanPembersih', e.target.value)} rows={2} style={inputStyle} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Bahan Kemasan</label>
                <textarea value={formData.bahanKemasan || ''} onChange={e => handleChange('bahanKemasan', e.target.value)} rows={2} style={inputStyle} />
              </div>
              <div style={fieldGroupStyle}>
                <label style={labelStyle}>Tata Cara Pembuatan</label>
                <textarea value={formData.tataCaraPembuatan || ''} onChange={e => handleChange('tataCaraPembuatan', e.target.value)} rows={3} style={inputStyle} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border)', fontWeight: 700, cursor: 'pointer' }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={18} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
