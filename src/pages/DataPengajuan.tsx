import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, onValue, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { Database, ChevronDown, ChevronUp, PlayCircle, Clock, CheckCircle, Edit } from 'lucide-react';
import { canPerformAction } from '../utils/permissions';
import EditPengajuanModal from '../components/EditPengajuanModal';

export default function DataPengajuan() {
  const { currentUser } = useAuth();
  const [pengajuanList, setPengajuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  useEffect(() => {
    const pengajuanRef = ref(db, 'pengajuan');
    const unsubscribe = onValue(pengajuanRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(item => item.status === 'Terverifikasi' || item.status === 'Proses') 
          .sort((a, b) => b.createdAt - a.createdAt); // Newest first
        setPengajuanList(list);
      } else {
        setPengajuanList([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateProses = async (id: string, currentNote: string = '') => {
    const defaultNote = currentNote || '';
    const note = window.prompt('Masukkan keterangan proses saat ini:', defaultNote);
    if (note === null) return; // User cancelled

    try {
      await update(ref(db, `pengajuan/${id}`), {
        status: 'Proses',
        keterangan_proses: note,
        diprosesAt: new Date().getTime(),
        diprosesBy: currentUser?.name || 'Petugas',
        diprosesById: currentUser?.id || ''
      });
    } catch (err) {
      console.error(err);
      alert('Gagal mengupdate status proses.');
    }
  };

  const handleUpdateWaiting = async (id: string) => {
    if (!window.confirm('Teruskan ke Validasi Admin (Waiting)? Anda tidak bisa lagi mengubah data ini setelah diteruskan.')) return;
    try {
      await update(ref(db, `pengajuan/${id}`), {
        status: 'Waiting',
        waitingAt: new Date().getTime()
      });
    } catch (err) {
      console.error(err);
      alert('Gagal meneruskan data.');
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
              <Database size={32} />
            </div>
            Data Pengajuan
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500, fontSize: '1rem' }}>
            Tangani permohonan yang telah diverifikasi. Ubah status menjadi Proses atau teruskan ke Admin (Waiting).
          </p>
        </div>
      </div>

      {pengajuanList.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Database size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Tidak ada data pengajuan aktif</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Semua data telah di proses atau sedang menunggu Validasi.</p>
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
                    {item.status === 'Terverifikasi' && (
                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        TERVERIFIKASI
                      </span>
                    )}
                    {item.status === 'Proses' && (
                      <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        PROSES
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Database size={14} /> {item.jenisLayanan}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> Diverifikasi: {item.verifiedAt ? new Date(item.verifiedAt).toLocaleString('id-ID') : '-'}
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
                  
                  {item.status === 'Proses' && item.keterangan_proses && (
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Keterangan Proses Saat Ini:</div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500, whiteSpace: 'pre-wrap' }}>{item.keterangan_proses}</div>
                    </div>
                  )}

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
                      </dl>
                    </div>

                    {/* Conditional Data Section based on jenisLayanan */}
                    <div>
                      <h4 style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        Detail Layanan ({item.jenisLayanan})
                      </h4>
                      
                      {(item.jenisLayanan === 'Pembuatan NIB' || item.jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )') && (
                        <dl className="detail-sub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: 0, fontSize: '0.9rem' }}>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nama Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.namaUsaha || '-'}</dd></div>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Jenis Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.jenisUsaha || '-'}</dd></div>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Modal Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>Rp {Number(item.modalUsaha).toLocaleString('id-ID') || '-'}</dd></div>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Lama Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.lamaUsaha || '-'}</dd></div>
                          <div style={{ gridColumn: '1 / -1' }}><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Lokasi Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.lokasiUsaha || '-'}</dd></div>
                        </dl>
                      )}

                      {item.jenisLayanan === 'Pembuatan Sertifikat Halal ( Selfdeclare )' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                          <dl className="detail-sub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: 0 }}>
                            <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nama Produk</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.namaProduk || '-'}</dd></div>
                            <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Lokasi Pabrik</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.lokasiPabrik || '-'}</dd></div>
                          </dl>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bahan Yang Digunakan (10 Item)</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.bahanDigunakan || '-'}</div></div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bahan Pembersih (5 Item)</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.bahanPembersih || '-'}</div></div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Bahan Kemasan (5 Item)</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.bahanKemasan || '-'}</div></div>
                          <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tata Cara Pembuatan</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.tataCaraPembuatan || '-'}</div></div>
                        </div>
                      )}

                      {item.deskripsi && (
                        <div><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', marginTop: '1rem' }}>Deskripsi Lama</div><div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', whiteSpace: 'pre-wrap' }}>{item.deskripsi}</div></div>
                      )}
                    </div>

                  </div>

                  {/* Actions Petugas */}
                  {canPerformAction(currentUser?.role || 'Guest', '/data-pengajuan', 'edit') && (
                    <div className="action-buttons-container">
                      <button 
                        onClick={() => handleUpdateProses(item.id, item.keterangan_proses)}
                        style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <PlayCircle size={20} /> Ubah Status & Keterangan (Proses)
                      </button>
                      <button 
                        onClick={() => handleUpdateWaiting(item.id)}
                        style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <CheckCircle size={20} /> Teruskan Ke Admin (Waiting)
                      </button>
                      <button 
                        onClick={() => setEditingData(item)}
                        style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                      >
                        <Edit size={20} /> Edit Data
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editingData && (
        <EditPengajuanModal 
          data={editingData} 
          onClose={() => setEditingData(null)} 
          onSuccess={() => { setEditingData(null); alert('Data berhasil diperbarui!'); }}
        />
      )}
    </div>
  );
}
