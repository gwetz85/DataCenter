import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserX, UserCheck, ChevronDown, Smartphone, Trash2, RotateCcw } from 'lucide-react';
import type { Role, UserStatus } from '../types/auth';

export default function ManajemenPengguna() {
  const { users, updateUserRole, currentUser, resetUserDevice, deleteUserAccount } = useAuth();

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

  const handleResetDevice = async (userId: string, name: string) => {
    if (window.confirm(`Reset ID perangkat untuk ${name}?`)) {
      await resetUserDevice(userId);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (window.confirm(`Hapus data user ${name}? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteUserAccount(userId);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="responsive-layout-split" style={{ marginBottom: '2.5rem' }}>
        <h1 className="mobile-text-responsive-h1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.25rem', fontWeight: 800 }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.6rem', borderRadius: '14px', display: 'flex' }}>
            <ShieldCheck size={32} />
          </div>
          Manajemen Pengguna
        </h1>
      </div>
      
      <div className="glass-card animate-enter" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>NAMA / EMAIL</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>ROLE</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>DEVICE ID</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>STATUS</th>
                <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px', textAlign: 'right' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} style={{ borderBottom: idx === users.length - 1 ? 'none' : '1px solid var(--border)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar" style={{ width: '42px', height: '42px', fontSize: '1.125rem', fontWeight: 700, borderRadius: '14px' }}>{u.name.charAt(0)}</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{u.name}</p>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {u.id !== currentUser?.id ? (
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role, u.status)}
                            style={{ 
                              background: 'rgba(0,0,0,0.1)', 
                              color: 'var(--text-main)', 
                              border: '1px solid var(--border)', 
                              borderRadius: '12px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              padding: '0.6rem 2.5rem 0.6rem 1rem',
                              appearance: 'none',
                              outline: 'none',
                              cursor: 'pointer',
                              minWidth: '150px'
                            }}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Verifikator">Verifikator</option>
                            <option value="Monitoring">Monitoring</option>
                            <option value="Petugas">Petugas</option>
                            <option value="Guest">Guest</option>
                          </select>
                          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '10px', width: 'fit-content' }}>
                          <ShieldCheck size={18} /> {u.role}
                        </span>
                      )}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: u.deviceId ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                      <Smartphone size={14} style={{ opacity: 0.5 }} />
                      {u.deviceId ? (
                        <span title={u.deviceId}>{u.deviceId.substring(0, 8)}...</span>
                      ) : (
                        <span style={{ fontStyle: 'italic', opacity: 0.5 }}>Belum Terdaftar</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    {u.status === 'active' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '30px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span> Aktif
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '30px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }}></span> Menunggu
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    {u.id !== currentUser?.id && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        {u.status === 'pending' ? (
                          <button 
                            onClick={() => handleApprove(u.id, u.role)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)' }}
                          >
                            <UserCheck size={16} /> Verifikasi
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDeactivate(u.id, u.role)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.6rem 1.25rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                          >
                            <UserX size={16} /> Nonaktifkan
                          </button>
                        )}
                        
                        {u.deviceId && (
                          <button 
                            onClick={() => handleResetDevice(u.id, u.name)}
                            title="Reset Perangkat"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          title="Hapus User"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <Trash2 size={16} />
                        </button>
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
