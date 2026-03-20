import { useState, useEffect } from 'react';
import { 
  CheckSquare, Activity, XCircle, Database, 
  BarChart3, ListChecks 
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    register: 0,
    terverifikasi: 0,
    tervalidasi: 0,
    monitoring: 0,
    ditolak: 0,
    selesai: 0,
    jenisLayanan: {} as Record<string, number>,
    recenterJobs: [] as any[]
  });

  useEffect(() => {
    const ptRef = ref(db, 'pengajuan');
    const unsubscribe = onValue(ptRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCounts({ 
          register: 0, terverifikasi: 0, tervalidasi: 0, 
          monitoring: 0, ditolak: 0, selesai: 0, jenisLayanan: {},
          recenterJobs: []
        });
        return;
      }

      const allJobs = Object.values(data);
      let registerCount = 0;
      let terverifikasiCount = 0;
      let tervalidasiCount = 0;
      let monitoringCount = 0;
      let ditolakCount = 0;
      let selesaiCount = 0;
      let jenisLayananMap: Record<string, number> = {};

      Object.values(data).forEach((item: any) => {
        registerCount++; // Cumulatively count all
        
        // Exact state counts
        if (item.status === 'Registrasi') {
          // Strictly in registration phase
        }
        if (['Terverifikasi', 'Tervalidasi', 'Monitoring', 'Selesai'].includes(item.status)) {
          terverifikasiCount++;
        }
        if (['Tervalidasi', 'Monitoring', 'Selesai'].includes(item.status)) {
          tervalidasiCount++;
        }
        if (item.status === 'Monitoring') {
          monitoringCount++;
        }
        if (item.status === 'Selesai') {
          selesaiCount++;
        }
        if (item.status === 'Ditolak') {
          ditolakCount++;
        }

        // Aggregate Layanan
        const layanan = item.jenisLayanan || 'Lainnya';
        if (!jenisLayananMap[layanan]) jenisLayananMap[layanan] = 0;
        jenisLayananMap[layanan]++;
      });

      setCounts({
        register: registerCount,
        terverifikasi: terverifikasiCount,
        tervalidasi: tervalidasiCount,
        monitoring: monitoringCount,
        ditolak: ditolakCount,
        selesai: selesaiCount,
        jenisLayanan: jenisLayananMap,
        recenterJobs: allJobs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5)
      });
    });

    return () => unsubscribe();
  }, []);

  const totalPendingVerifikasi = counts.register - counts.terverifikasi - counts.ditolak;
  const totalPendingValidasi = counts.terverifikasi - counts.tervalidasi;

  const calculateProgress = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeInScale 0.4s ease-out' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 900, 
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(90deg, #0ea5e9, #10b981)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px'
          }}>
            DASHBOARD
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.95rem' }}>
            Monitor dan kelola pendaftaran layanan data centre secara real-time.
          </p>
        </div>
        
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: '#10b981',
          padding: '0.5rem 1rem',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '1px'
        }}>
          <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></span>
          SISTEM: AKTIF & SINKRON
        </div>
      </div>

      {/* TOP 5 CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>TOTAL REGISTER</span>
            <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.5rem', borderRadius: '8px' }}>
               <Database size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 800 }}>{counts.register}</h2>
          <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             📈 DATA TERKINI
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>TERVERIFIKASI</span>
            <div style={{ background: '#f0fdf4', color: '#10b981', padding: '0.5rem', borderRadius: '8px' }}>
               <ListChecks size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 800 }}>{counts.terverifikasi}</h2>
          <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             📈 DATA TERKINI
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>TERVALIDASI</span>
            <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.5rem', borderRadius: '8px' }}>
               <CheckSquare size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 800 }}>{counts.tervalidasi}</h2>
          <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             📈 DATA TERKINI
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>MONITORING AKTIF</span>
            <div style={{ background: '#fffbeb', color: '#d97706', padding: '0.5rem', borderRadius: '8px' }}>
               <Activity size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 800 }}>{counts.monitoring}</h2>
          <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             📈 DATA TERKINI
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>DATA DITOLAK</span>
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.5rem', borderRadius: '8px' }}>
               <XCircle size={16} />
            </div>
          </div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: '#0f172a', fontWeight: 800 }}>{counts.ditolak}</h2>
          <div style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
             📈 DATA TERKINI
          </div>
        </div>
      </div>

      {/* LOWER SECTION */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* MIDDLE SECTION: Monitoring Pekerjaan */}
        <div className="glass-card" style={{ flex: 2, padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Activity size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#0f172a' }}>Monitoring Pekerjaan</h3>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Nama</th>
                <th style={{ padding: '1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Pekerjaan</th>
                <th style={{ padding: '1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {counts.recenterJobs.length > 0 ? counts.recenterJobs.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: idx === counts.recenterJobs.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{item.authorName || 'Anonim'}</div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#475569' }}>{item.namaPekerjaan}</div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      padding: '4px 10px', 
                      borderRadius: '12px',
                      background: item.status === 'Registrasi' ? '#eff6ff' : 
                                 item.status === 'Ditolak' ? '#fef2f2' : 
                                 item.status === 'Selesai' ? '#f0fdf4' : '#fffbeb',
                      color: item.status === 'Registrasi' ? '#3b82f6' : 
                             item.status === 'Ditolak' ? '#ef4444' : 
                             item.status === 'Selesai' ? '#10b981' : '#d97706'
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    Belum ada data pekerjaan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT COLUMN: Progres Verifikasi */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <BarChart3 size={20} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#0f172a' }}>Progres Verifikasi</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  <span>Pending Verifikasi</span>
                  <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '12px' }}>{Math.max(0, totalPendingVerifikasi)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${calculateProgress(totalPendingVerifikasi, counts.register)}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  <span>Pending Validasi</span>
                  <span style={{ background: '#fffbeb', color: '#d97706', padding: '2px 8px', borderRadius: '12px' }}>{Math.max(0, totalPendingValidasi)}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${calculateProgress(totalPendingValidasi, counts.register)}%`, height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  <span>Selesai (Finish)</span>
                  <span style={{ background: '#f0fdf4', color: '#10b981', padding: '2px 8px', borderRadius: '12px' }}>{counts.selesai}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${calculateProgress(counts.selesai, counts.register)}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                  <span>Ditolak / Batal</span>
                  <span style={{ background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px' }}>{counts.ditolak}</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${calculateProgress(counts.ditolak, counts.register)}%`, height: '100%', background: '#ef4444', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
