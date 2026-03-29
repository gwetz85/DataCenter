import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { FileCheck, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { canPerformAction } from '../utils/permissions';

export default function VerifikasiData() {
  const { currentUser } = useAuth();
  const [pengajuanList, setPengajuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const pengajuanRef = ref(db, 'pengajuan');
    const unsubscribe = onValue(pengajuanRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(item => item.status === 'Registrasi') // Only show new registrations from the registration menu
          .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)); // Newest first
        setPengajuanList(list);
      } else {
        setPengajuanList([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleVerifikasi = async (id: string) => {
    if (!window.confirm('Verifikasi data ini dan teruskan ke Data Pengajuan?')) return;
    try {
      await update(ref(db, `pengajuan/${id}`), {
        status: 'Terverifikasi',
        verifiedAt: new Date().getTime(),
        verifiedBy: currentUser?.name || 'Admin',
        verifiedById: currentUser?.id || ''
      });
    } catch (err) {
      console.error(err);
      alert('Gagal memverifikasi data.');
    }
  };

  const handleTolak = async (id: string) => {
    const alasan = window.prompt('Masukkan alasan penolakan:');
    if (alasan === null) return; // User cancelled
    try {
      await update(ref(db, `pengajuan/${id}`), {
        status: 'Ditolak',
        ditolakAt: new Date().getTime(),
        ditolakBy: currentUser?.name || 'Admin',
        ditolakById: currentUser?.id || '',
        alasanPenolakan: alasan || 'Tidak ada alasan'
      });
    } catch (err) {
      console.error(err);
      alert('Gagal menolak data.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('PERINGATAN: Anda yakin ingin menghapus permanen data ini? Tindakan ini tidak data dibatalkan.')) return;
    try {
      await remove(ref(db, `pengajuan/${id}`));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
        Memuat data...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="responsive-layout-split" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="mobile-text-responsive-h1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex' }}>
              <FileCheck size={32} />
            </div>
            Verifikasi Data
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500, fontSize: '1rem' }}>
            Periksa dan verifikasi pendaftaran baru dari Petugas atau pengguna.
          </p>
        </div>
      </div>

      {pengajuanList.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <FileCheck size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Belum ada data untuk diverifikasi</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Semua pengajuan telah diproses.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pengajuanList.map((item) => (
            <div key={item.id} className="glass-card animate-enter" style={{ overflow: 'hidden' }}>
              
              {/* Header Card / collapsed view */}
              <div 
                className="responsive-header"
                style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedId === item.id ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s', flexWrap: 'wrap', gap: '1rem' }}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.namaPekerjaan || item.nama}
                    </h3>
                    <span style={{ 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      color: '#3b82f6', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem', 
                      fontWeight: 800, 
                      border: '1px solid rgba(59, 130, 246, 0.2)' 
                    }}>
                      MENUNGGU VERIFIKASI
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileCheck size={14} /> {item.jenisLayanan}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> {new Date(item.createdAt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {expandedId === item.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {/* Detail View */}
              {expandedId === item.id && (
                <div className="animate-enter" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                  <div className="detail-container">
                    
                    {/* Data Diri Section */}
                    <div>
                      <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Data Pemohon</h4>
                      <dl style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', margin: 0, fontSize: '0.9rem' }}>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nama Lengkap</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nama || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Jenis Kelamin</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.jenisKelamin || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>NIK KTP</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nik || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nomor KK</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nomorKk || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Tempat / Tgl Lahir</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.tempatLahir || '-'}{item.tanggalLahir ? ` / ${item.tanggalLahir}` : ''}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>No. Ponsel</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nomorPonsel || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Alamat</dt><dd style={{ margin: 0, fontWeight: 500, whiteSpace: 'pre-wrap' }}>{item.alamat || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Author (Petugas Input)</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.authorName}</dd></div>
                      </dl>
                    </div>

                    {/* Conditional Data Section based on jenisLayanan */}
                    <div>
                      <h4 style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        Detail Layanan ({item.jenisLayanan})
                      </h4>
                      
                      {(item.jenisLayanan === 'Pembuatan NIB' || item.jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )') && (
                        <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: 0, fontSize: '0.9rem' }}>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nama Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.namaUsaha || '-'}</dd></div>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Jenis Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.jenisUsaha || '-'}</dd></div>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Modal Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>Rp {Number(item.modalUsaha).toLocaleString('id-ID') || '-'}</dd></div>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Lama Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.lamaUsaha || '-'}</dd></div>
                          <div style={{ gridColumn: '1 / -1' }}><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Lokasi Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.lokasiUsaha || '-'}</dd></div>
                        </dl>
                      )}

                      {item.jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: 0 }}>
                            <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nama Produk</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.namaProduk || '-'}</dd></div>
                            <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Lokasi Pabrik</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.lokasiPabrik || '-'}</dd></div>
                          </dl>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bahan Yang Digunakan (10 Item)</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.bahanDigunakan || '-'}</div></div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bahan Pembersih (5 Item)</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.bahanPembersih || '-'}</div></div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bahan Kemasan (5 Item)</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.bahanKemasan || '-'}</div></div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tata Cara Pembuatan</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.tataCaraPembuatan || '-'}</div></div>
                        </div>
                      )}

                      {/* Display legacy fields just in case */}
                      {item.deskripsi && (
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', marginTop: '1rem' }}>Deskripsi Lama</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.deskripsi}</div></div>
                      )}
                    </div>

                  </div>

                  {/* Actions */}
                  {canPerformAction(currentUser?.role || 'Guest', '/verifikasi-data', 'edit') && (
                    <div className="action-buttons-container">
                      <button 
                        onClick={() => handleVerifikasi(item.id)}
                        style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <CheckCircle size={20} /> Verifikasi
                      </button>
                      <button 
                        onClick={() => handleTolak(item.id)}
                        style={{ padding: '1rem 1.5rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <XCircle size={20} /> Tolak
                      </button>
                      {canPerformAction(currentUser?.role || 'Guest', '/verifikasi-data', 'delete') && (
                        <button 
                          onClick={() => handleDelete(item.id)}
                          style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.1)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                          title="Hapus Permanen"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
