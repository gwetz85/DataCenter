
import React from 'react';
import { ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

const CekHalal: React.FC = () => {
  const portalUrl = "https://bpjph.halal.go.id/data-rekapitulasi-sehati/";

  return (
    <div className="page-container p-4 md:p-6 lg:p-8" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">CEK DATA HALAL</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitoring data rekapitulasi dari BPJPH Kementerian Agama RI
          </p>
        </div>
        
        <a 
          href={portalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm w-fit"
        >
          <ExternalLink size={16} />
          Buka di Tab Baru
        </a>
      </div>

      {/* Info Warning */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex gap-3">
        <HelpCircle className="text-amber-500 shrink-0" size={20} />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Pemberitahuan</p>
          <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
            Halaman ini memuat aplikasi eksternal dari BPJPH. Jika halaman di bawah terlihat kosong atau tidak muncul, klik tombol <strong>"Buka di Tab Baru"</strong> di atas.
          </p>
        </div>
      </div>

      {/* Iframe Section */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group">
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse -z-10 flex items-center justify-center">
            <div className="text-slate-400 font-medium">Memuat data dari portal BPJPH...</div>
        </div>
        <iframe 
          src={portalUrl} 
          className="w-full h-full border-none"
          title="BPJPH Data Rekapitulasi"
        />
      </div>
    </div>
  );
};

export default CekHalal;
