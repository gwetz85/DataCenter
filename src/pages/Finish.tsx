import { useAuth } from '../context/AuthContext';
import { canEdit } from '../utils/permissions';
import { Edit2, Trash2 } from 'lucide-react';

export default function Finish() {
  const { currentUser } = useAuth();
  
  // Guard against null though this route is protected
  const hasEditAccess = currentUser ? canEdit(currentUser.role, '/finish') : false;

  return (
    <div>
      <h1>Finish</h1>
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>Daftar pekerjaan yang telah diselesaikan.</p>
          {hasEditAccess && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                <Edit2 size={16} /> Edit Data
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                <Trash2 size={16} /> Hapus Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
