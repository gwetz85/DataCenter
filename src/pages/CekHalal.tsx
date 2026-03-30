
import React from 'react';
import { ExternalLink } from 'lucide-react';

const CekHalal: React.FC = () => {
  const portalUrl = "https://bpjph.halal.go.id/data-rekapitulasi-sehati/";

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      {/* Floating Action Bar - Only visible on hover or with opacity */}
      <div className="absolute top-3 right-3 z-50 transition-opacity opacity-40 hover:opacity-100">
        <a 
          href={portalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-900 text-white rounded-xl shadow-2xl backdrop-blur-md transition-all active:scale-95 font-bold text-xs border border-white/10"
        >
          <ExternalLink size={14} />
          BUKA DI TAB BARU
        </a>
      </div>

      {/* Full Screen Iframe Section */}
      <div className="flex-1 bg-white dark:bg-slate-900 overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse -z-10 flex items-center justify-center">
            <div className="text-slate-400 font-medium">Memuat data dari portal BPJPH...</div>
        </div>
        <iframe 
          src={portalUrl} 
          className="w-full h-full border-none"
          title="BPJPH Data Rekapitulasi"
          style={{ minHeight: 'calc(100vh - 120px)', flex: 1 }}
        />
      </div>
    </div>
  );
};

export default CekHalal;
