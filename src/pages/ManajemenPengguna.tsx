import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserX, UserCheck, ChevronDown } from 'lucide-react';
import type { Role, UserStatus } from '../types/auth';
export default function ManajemenPengguna() {
  const { users, updateUserRole, currentUser } = useAuth();

  const handleRoleChange = (userId: string, newRole: Role, currentStatus: UserStatus) => {
    updateUserRole(userId, newRole, currentStatus);
  };

  const handleApprove = (userId: string, currentRole: Role) => {
    // If they approve but role is still Guest, default to Petugas so they have some access
    const finalRole = currentRole === 'Guest' ? 'Petugas' : currentRole;
    updateUserRole(userId, finalRole, 'active');
  };

  const handleDeactivate = (userId: string, currentRole: Role) => {
    updateUserRole(userId, currentRole, 'pending');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manajemen Pengguna</h1>
      </div>
      
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>NAMA / EMAIL</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>ROLE</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>STATUS</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '1rem', flexShrink: 0 }}>{u.name.charAt(0)}</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '0.875rem' }}>{u.name}</p>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.id !== currentUser?.id ? (
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role, u.status)}
                            style={{ 
                              background: 'rgba(0,0,0,0.2)', 
                              color: 'var(--text-main)', 
                              border: '1px solid var(--border)', 
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              padding: '0.5rem 2rem 0.5rem 0.75rem',
                              appearance: 'none',
                              outline: 'none',
                              cursor: 'pointer',
                              minWidth: '130px'
                            }}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Verifikator">Verifikator</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Petugas">Petugas</option>
                            <option value="Guest">Guest</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: '8px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <ShieldCheck size={16} /> {u.role}
                        </span>
                      )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.status === 'active' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }}></span> Aktif
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.75rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }}></span> Menunggu
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {u.id !== currentUser?.id && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {u.status === 'pending' ? (
                          <button 
                            onClick={() => handleApprove(u.id, u.role)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                          >
                            <UserCheck size={14} /> Verifikasi
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDeactivate(u.id, u.role)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                          >
                            <UserX size={14} /> Nonaktifkan
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
