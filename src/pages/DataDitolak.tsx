import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { XCircle, Search, Calendar, User } from 'lucide-react';

export default function DataDitolak() {
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const ptRef = ref(db, 'pengajuan');
    const unsubscribe = onValue(ptRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        const filtered = Object.values(val).filter((item: any) => item.status === 'Ditolak');
        setData(filtered.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)));
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredData = data.filter(item => 
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nik?.includes(searchTerm)
  );

  return (
    <div className="animate-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Data Ditolak</h1>
          <p style={{ color: 'var(--text-muted)' }}>Berkas pendaftaran yang tidak memenuhi syarat atau ditolak.</p>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.75rem' }}>
          <XCircle size={16} /> {data.length} BERKAS
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NIK..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: '12px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {filteredData.map((item, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800 }}>
                DITOLAK
              </div>
            </div>
            
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{item.nama}</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0 0 0.5rem 0' }}>NIK: {item.nik}</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 600, margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>
              Lahir: {item.tempatLahir || '-'}{item.tanggalLahir ? ` / ${item.tanggalLahir}` : ''}
            </p>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString('id-ID')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                Alasan: {item.keterangan || 'Tidak ada keterangan tambahan.'}
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <XCircle size={48} style={{ marginBottom: '1rem' }} />
            <p>Tidak ada data ditolak yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
