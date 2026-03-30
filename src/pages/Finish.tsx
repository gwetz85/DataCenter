import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { CheckCircle, ChevronDown, ChevronUp, Clock, FileCheck, Search, Filter, MapPin } from 'lucide-react';

export default function Finish() {
  const [pengajuanList, setPengajuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('Semua Layanan');

  useEffect(() => {
    const pengajuanRef = ref(db, 'pengajuan');
    const unsubscribe = onValue(pengajuanRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(item => item.status === 'SELESAI') 
          .sort((a, b) => b.selesaiAt - a.selesaiAt); // Sort by finish time, newest first
        setPengajuanList(list);
      } else {
        setPengajuanList([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredList = pengajuanList.filter(item => {
    const matchesSearch = (item.nama || item.namaPekerjaan || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.nik || '').includes(searchTerm);
    const matchesService = serviceFilter === 'Semua Layanan' || item.jenisLayanan === serviceFilter;
    return matchesSearch && matchesService;
  });

  const uniqueServices = Array.from(new Set(pengajuanList.map(item => item.jenisLayanan))).filter(Boolean);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          Memuat data arsip...
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="responsive-layout-split" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="mobile-text-responsive-h1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex' }}>
              <CheckCircle size={32} />
            </div>
            Data Selesai
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontWeight: 500, fontSize: '1rem' }}>
            Arsip seluruh pekerjaan dan pengajuan yang telah selesai divalidasi.
          </p>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} /> {pengajuanList.length} TOTAL SELESAI
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 'min(300px, 100%)', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input 
            type="text" 
            placeholder="Cari nama pemohon atau NIK..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none' }}
          />
        </div>
        <div style={{ position: 'relative', width: '100%', maxWidth: '200px' }}>
          <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <select 
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer', appearance: 'none' }}
          >
            <option value="Semua Layanan">Semua Layanan</option>
            {uniqueServices.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <CheckCircle size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Data tidak ditemukan</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Coba sesuaikan pencarian atau filter Anda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredList.map((item) => (
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
                    <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      SELESAI
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileCheck size={14} /> {item.jenisLayanan}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> Diselesaikan Pada: {item.selesaiAt ? new Date(item.selesaiAt).toLocaleString('id-ID') : '-'}
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
                  
                  {/* Timeline Summary */}
                  <div className="responsive-grid-3" style={{ marginBottom: '2rem' }}>
                     <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Dibuat Oleh Petugas</div>
                       <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.authorName || '-'}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-'}</div>
                     </div>
                     <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Diverifikasi Admin</div>
                       <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.verifiedBy || '-'}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.verifiedAt ? new Date(item.verifiedAt).toLocaleString('id-ID') : '-'}</div>
                     </div>
                     <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Divalidasi Admin (Selesai)</div>
                       <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.selesaiBy || '-'}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.selesaiAt ? new Date(item.selesaiAt).toLocaleString('id-ID') : '-'}</div>
                     </div>
                  </div>

                  {item.keterangan_proses && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '1px' }}>Catatan Proses Terakhir 📝</div>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{item.keterangan_proses}</div>
                    </div>
                  )}

                  <div className="detail-container">
                    
                    {/* Data Diri Section */}
                    <div>
                      <h4 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Data Pemohon</h4>
                      <dl style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', margin: 0, fontSize: '0.9rem' }}>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>NIK KTP</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nik || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Nomor KK</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.nomorKk || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Tgl Lahir</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.tanggalLahir || '-'}</dd></div>
                        <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Email</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.email || '-'}</dd></div>
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
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Luas Bangunan</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.luasBangunan ? `${item.luasBangunan} m2` : '-'}</dd></div>
                          <div><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Penghasilan / Thn</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.penghasilanTahunan ? `Rp ${Number(item.penghasilanTahunan).toLocaleString('id-ID')}` : '-'}</dd></div>
                          <div style={{ gridColumn: '1 / -1' }}><dt style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>Lokasi Usaha</dt><dd style={{ margin: 0, fontWeight: 500 }}>{item.lokasiUsaha || '-'}</dd></div>
                        </dl>
                      )}

                      {/* Display Coordinate */}
                      {item.koordinat && (
                        <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ background: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
                            <MapPin size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Koordinat Lokasi Terverifikasi</div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{item.koordinat}</div>
                          </div>
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${item.koordinat}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 600, border: '1px solid var(--border)' }}
                          >
                            Buka Maps
                          </a>
                        </div>
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

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
