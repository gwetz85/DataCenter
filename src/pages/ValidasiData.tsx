import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, ChevronDown, ChevronUp, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { canPerformAction } from '../utils/permissions';

export default function ValidasiData() {
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
          .filter(item => item.status === 'Waiting') 
          .sort((a, b) => b.createdAt - a.createdAt); // Newest first
        setPengajuanList(list);
      } else {
        setPengajuanList([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleValidasiSelesai = async (id: string) => {
    if (!window.confirm('Validasi data ini dan nyatakan SELESAI?')) return;
    try {
      await update(ref(db, `pengajuan/${id}`), {
        status: 'SELESAI',
        selesaiAt: new Date().getTime(),
        selesaiBy: currentUser?.name || 'Admin',
        selesaiById: currentUser?.id || ''
      });
    } catch (err) {
      console.error(err);
      alert('Gagal memvalidasi data.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex' }}>
              <CheckSquare size={32} />
            </div>
            Validasi Data Administrasi
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500, fontSize: '1rem' }}>
            Periksa pekerjaan Petugas yang berstatus Waiting dan selesaikan proses.
          </p>
        </div>
      </div>

      {pengajuanList.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <CheckSquare size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Tidak ada data yang menunggu validasi</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Semua pekerjaan Petugas telah divalidasi.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pengajuanList.map((item) => (
            <div key={item.id} className="glass-card animate-enter" style={{ overflow: 'hidden' }}>
              
              {/* Header Card / collapsed view */}
              <div 
                style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedId === item.id ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.namaPekerjaan || item.nama}
                    </h3>
                    <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      WAITING (Menunggu Validasi)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckSquare size={14} /> {item.jenisLayanan}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> Diproses Petugas: {item.diprosesAt || item.waitingAt ? new Date(item.diprosesAt || item.waitingAt).toLocaleString('id-ID') : '-'}
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
                <div className="animate-enter" style={{ padding: '2rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                  
                  {item.keterangan_proses && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Catatan Proses dari Petugas 📝</div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{item.keterangan_proses}</div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>
                    
                    {/* Data Diri Section */}
                    <div>
                      <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Data Pemohon</h4>
                      <dl style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', margin: 0, fontSize: '0.9rem' }}>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nama Lengkap</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nama || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>NIK KTP</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nik || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Tempat / Tgl Lahir</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.tempatLahir || '-'}{item.tanggalLahir ? ` / ${item.tanggalLahir}` : ''}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>No. Ponsel</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nomorPonsel || '-'}</dd></div>
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
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Modal Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>Rp {Number(item.modalUsaha).toLocaleString('id-ID') || '-'}</dd></div>
                        </dl>
                      )}

                      {item.jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: 0 }}>
                            <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nama Produk</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.namaProduk || '-'}</dd></div>
                          </dl>
                        </div>
                      )}

                      {item.deskripsi && (
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', marginTop: '1rem' }}>Deskripsi</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.deskripsi}</div></div>
                      )}
                    </div>

                  </div>

                  {/* Actions Admin Validasi */}
                  {canPerformAction(currentUser?.role || 'Guest', '/validasi-data', 'edit') && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <button 
                        onClick={() => handleValidasiSelesai(item.id)}
                        style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <CheckCircle size={20} /> Validasi Selesai (Pindahkan ke Finish)
                      </button>
                      {canPerformAction(currentUser?.role || 'Guest', '/validasi-data', 'delete') && (
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
