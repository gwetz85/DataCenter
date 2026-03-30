
import React from 'react';
import { ExternalLink } from 'lucide-react';

const CekHalal: React.FC = () => {
  const portalUrl = "https://bpjph.halal.go.id/data-rekapitulasi-sehati/";

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Floating Action Bar */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 50, opacity: 0.6 }}>
        <a 
          href={portalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
            background: 'rgba(30, 41, 59, 0.8)', color: 'white', borderRadius: '12px', 
            textDecoration: 'none', fontWeight: 700, fontSize: '0.75rem', 
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' 
          }}
          onMouseEnter={(e) => e.currentTarget.parentElement!.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.parentElement!.style.opacity = '0.6'}
        >
          <ExternalLink size={14} />
          BUKA DI TAB BARU
        </a>
      </div>

      {/* Full Screen Iframe Section */}
      <div style={{ flex: 1, background: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: -1 }}>
            <div style={{ color: '#94a3b8', fontWeight: 500 }}>Memuat data dari portal BPJPH...</div>
        </div>
        <iframe 
          src={portalUrl} 
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="BPJPH Data Rekapitulasi"
          scrolling="yes"
        />
      </div>
    </div>
  );
};

export default CekHalal;
