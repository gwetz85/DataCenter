import { useState, useEffect } from 'react';
import { Users, FileCheck, CheckSquare, Activity } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../config/firebase';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    register: 0,
    terverifikasi: 0,
    tervalidasi: 0,
    monitoring: 0
  });

  useEffect(() => {
    const ptRef = ref(db, 'pengajuan');
    const unsubscribe = onValue(ptRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCounts({ register: 0, terverifikasi: 0, tervalidasi: 0, monitoring: 0 });
        return;
      }

      let registerCount = 0;
      let terverifikasiCount = 0;
      let tervalidasiCount = 0;
      let monitoringCount = 0;

      Object.values(data).forEach((item: any) => {
        registerCount++; // Cumulatively count all registered items
        
        if (['Terverifikasi', 'Tervalidasi', 'Monitoring', 'Selesai'].includes(item.status)) {
          terverifikasiCount++;
        }
        
        if (['Tervalidasi', 'Monitoring', 'Selesai'].includes(item.status)) {
          tervalidasiCount++;
        }

        if (item.status === 'Monitoring') {
          monitoringCount++;
        }
      });

      setCounts({
        register: registerCount,
        terverifikasi: terverifikasiCount,
        tervalidasi: tervalidasiCount,
        monitoring: monitoringCount
      });
    });

    return () => unsubscribe();
  }, []);
  return (
    <div>
      <h1>Dashboard Pusat</h1>
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Total Register</h3>
            <p>{counts.register}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><FileCheck size={24} /></div>
          <div className="stat-info">
            <h3>Data Terverifikasi</h3>
            <p>{counts.terverifikasi}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><CheckSquare size={24} /></div>
          <div className="stat-info">
            <h3>Data Tervalidasi</h3>
            <p>{counts.tervalidasi}</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Activity size={24} /></div>
          <div className="stat-info">
            <h3>Monitoring Aktif</h3>
            <p>{counts.monitoring}</p>
          </div>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '1.5rem', minHeight: '300px' }}>
        <h2>Aktivitas Terkini</h2>
        <p>Belum ada aktivitas baru pada sistem ini.</p>
      </div>
    </div>
  );
}
