import { Users, FileCheck, CheckSquare, Activity } from 'lucide-react';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard Pusat</h1>
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Total Register</h3>
            <p>0</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><FileCheck size={24} /></div>
          <div className="stat-info">
            <h3>Data Terverifikasi</h3>
            <p>0</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><CheckSquare size={24} /></div>
          <div className="stat-info">
            <h3>Data Tervalidasi</h3>
            <p>0</p>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon"><Activity size={24} /></div>
          <div className="stat-info">
            <h3>Monitoring Aktif</h3>
            <p>0</p>
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
