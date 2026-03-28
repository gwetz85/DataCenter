
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../config/firebase';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { ref as sRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Calendar, Plus, Clock, MapPin, X, AlertCircle, CheckCircle2, List, Phone, Image as ImageIcon, Trash2, Edit3 } from 'lucide-react';
import { canPerformAction } from '../utils/permissions';

interface Participant {
  id: string;
  nama: string;
  nomorPonsel: string;
  alamat: string;
}

interface EventData {
  id: string;
  agenda: string;
  tanggal: string;
  jam: string;
  lokasi: string;
  thumbnailUrl?: string;
  createdAt: number;
  participants?: Record<string, Participant>;
}

export default function Event() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Aktif' | 'Arsip'>('Aktif');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for adding event
  const [agenda, setAgenda] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [jam, setJam] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

  // Form states for adding participant
  const [pNama, setPNama] = useState('');
  const [pNomor, setPNomor] = useState('');
  const [pAlamat, setPAlamat] = useState('');
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);

  // Thumbnail Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const activeEvent = selectedEvent ? events.find(e => e.id === selectedEvent.id) || selectedEvent : null;

  const canAddEvent = currentUser ? canPerformAction(currentUser.role, '/event', 'add') : false;

  useEffect(() => {
    const eventsRef = ref(db, 'events');
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.values(data) as EventData[];
        setEvents(list.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setEvents([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenda || !tanggal || !jam || !lokasi) {
      setStatus({ type: 'error', msg: 'Harap isi semua bidang!' });
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    try {
      let thumbnailUrl = isEditing ? selectedEvent?.thumbnailUrl || '' : '';
      
      // Upload new image if file is selected
      if (imageFile) {
        const storagePath = `event_thumbnails/${Date.now()}_${imageFile.name}`;
        const fileRef = sRef(storage, storagePath);
        const uploadTask = uploadBytesResumable(fileRef, imageFile);
        
        thumbnailUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });

        // Delete old thumbnail if updating and new one uploaded
        if (isEditing && selectedEvent?.thumbnailUrl) {
           try {
              const oldImgRef = sRef(storage, selectedEvent.thumbnailUrl);
              await deleteObject(oldImgRef);
           } catch(e) { console.warn("Old thumbnail delete failed", e); }
        }
      }

      if (isEditing && editingId) {
        const updateData: Partial<EventData> = {
          agenda, tanggal, jam, lokasi, thumbnailUrl
        };
        await update(ref(db, `events/${editingId}`), updateData);
        setStatus({ type: 'success', msg: 'Event berhasil diperbarui!' });
      } else {
        const newRef = push(ref(db, 'events'));
        const newEvent: EventData = {
          id: newRef.key as string,
          agenda,
          tanggal,
          jam,
          lokasi,
          thumbnailUrl,
          createdAt: new Date().getTime()
        };
        await set(newRef, newEvent);
        setStatus({ type: 'success', msg: 'Event berhasil ditambahkan!' });
      }

      setAgenda(''); setTanggal(''); setJam(''); setLokasi(''); setImageFile(null); setUploadProgress(0);
      setTimeout(() => { setIsAddModalOpen(false); setStatus(null); setIsEditing(false); setEditingId(null); }, 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Gagal memproses event.' });
    }
    setIsSubmitting(false);
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !pNama || !pNomor || !pAlamat) return;
    
    try {
      const pRef = push(ref(db, `events/${activeEvent.id}/participants`));
      const newParticipant: Participant = {
        id: pRef.key as string,
        nama: pNama,
        nomorPonsel: pNomor,
        alamat: pAlamat
      };
      await set(pRef, newParticipant);
      setPNama(''); setPNomor(''); setPAlamat('');
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('id-ID', options);
  };

  const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' });
  };

  const handleDeleteEvent = async (id: string, thumbnailUrl?: string) => {
    if (!window.confirm('Hapus event ini secara permanen? Semua data peserta juga akan dihapus.')) return;
    try {
      await remove(ref(db, `events/${id}`));
      if (thumbnailUrl) {
         try {
            const imgRef = sRef(storage, thumbnailUrl);
            await deleteObject(imgRef);
         } catch (e) { console.warn("Failed to delete storage image: ", e); }
      }
      if (selectedEvent?.id === id) setIsDetailModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus event.');
    }
  };

  const handleDeleteParticipant = async (eventId: string, pId: string) => {
    if (!window.confirm('Hapus peserta ini dari daftar?')) return;
    try {
      await remove(ref(db, `events/${eventId}/participants/${pId}`));
    } catch (err) {
      console.error(err);
    }
  };

  const isExpired = (date: string, time: string) => {
    return new Date(`${date}T${time}`).getTime() < new Date().getTime();
  };

  const filteredEvents = events.filter(ev => {
    const expired = isExpired(ev.tanggal, ev.jam);
    return activeTab === 'Aktif' ? !expired : expired;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeInScale 0.4s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '3rem', fontWeight: 900, margin: 0,
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            EVENT MANAGEMENT
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Kelola jadwal kegiatan dan peserta secara mandiri.</p>
        </div>
        {canAddEvent && (
          <button 
            onClick={() => {
              setIsEditing(false);
              setAgenda(''); setTanggal(''); setJam(''); setLokasi(''); setImageFile(null); setUploadProgress(0);
              setIsAddModalOpen(true);
            }}
            style={{ 
              background: 'var(--primary)', color: 'white', padding: '1rem 1.5rem', borderRadius: '16px',
              border: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem',
              cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
              transition: 'all 0.3s'
            }}
          >
            <Plus size={20} />
            TAMBAH EVENT
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '20px', width: 'fit-content', border: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('Aktif')}
          style={{ 
            padding: '0.6rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer',
            background: activeTab === 'Aktif' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'Aktif' ? 'white' : 'var(--text-muted)',
            transition: 'all 0.3s'
          }}
        >
          KEGIATAN AKTIF
        </button>
        <button 
          onClick={() => setActiveTab('Arsip')}
          style={{ 
            padding: '0.6rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer',
            background: activeTab === 'Arsip' ? 'var(--surface-hover)' : 'transparent',
            color: activeTab === 'Arsip' ? 'var(--text-main)' : 'var(--text-muted)',
            transition: 'all 0.3s'
          }}
        >
          ARSIP KEGIATAN
        </button>
      </div>

      {/* Grid List */}
      <div className="dashboard-grid">
        {filteredEvents.length > 0 ? filteredEvents.map(ev => {
          const pCount = ev.participants ? Object.keys(ev.participants).length : 0;
          return (
            <div 
              key={ev.id} 
              className="glass-card" 
              style={{ padding: '0', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
              onClick={() => { setSelectedEvent(ev); setIsDetailModalOpen(true); }}
            >
              {/* Thumbnail Header */}
              <div style={{ height: '140px', background: ev.thumbnailUrl ? `url(${ev.thumbnailUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #a855f7)', position: 'relative' }}>
                 {!ev.thumbnailUrl && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0.5 }}><ImageIcon size={40} /></div>}
                 
                 <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>
                      {activeTab === 'Aktif' ? 'JADWAL AKTIF' : 'TELAH SELESAI'}
                    </div>
                    {canPerformAction(currentUser?.role || 'Guest', '/event', 'edit') && (
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setAgenda(ev.agenda); setTanggal(ev.tanggal); setJam(ev.jam); setLokasi(ev.lokasi);
                          setIsEditing(true); setEditingId(ev.id); setSelectedEvent(ev);
                          setIsAddModalOpen(true);
                        }}
                        style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem', borderRadius: '50%', color: 'white', cursor: 'pointer' }}
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    {canPerformAction(currentUser?.role || 'Guest', '/event', 'delete') && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id, ev.thumbnailUrl); }}
                        style={{ background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem', borderRadius: '50%', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                 </div>

                 {/* Mini Countdown Overlay */}
                 <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1rem 1.5rem 0.75rem 1.5rem' }}>
                   <MiniCountdown targetDate={`${ev.tanggal}T${ev.jam}`} />
                 </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0', color: 'var(--text-main)', lineBreak: 'anywhere', flex: 1 }}>{ev.agenda}</h3>
                  <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, marginLeft: '0.5rem' }}>
                    {pCount} PESERTA
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Calendar size={14} />
                  {getDayName(ev.tanggal)}, {formatDate(ev.tanggal)} • {ev.jam}
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <Calendar size={48} style={{ marginBottom: '1rem' }} />
            <p>Belum ada kegiatan {activeTab === 'Aktif' ? 'terdaftar' : 'di arsip'}.</p>
          </div>
        )}
      </div>

      {/* Modal Tambah Event */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '32px', position: 'relative' }}>
            <button onClick={() => { setIsAddModalOpen(false); setIsEditing(false); setEditingId(null); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem', textAlign: 'center' }}>{isEditing ? 'EDIT KEGIATAN' : 'TAMBAH KEGIATAN'}</h2>
            
            {status && (
              <div style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: status.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>
                {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {status.msg}
              </div>
            )}

            <form onSubmit={handleAddEvent}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', opacity: 0.7 }}>AGENDA</label>
                <input type="text" value={agenda} onChange={e => setAgenda(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', opacity: 0.7 }}>TANGGAL</label>
                  <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', opacity: 0.7 }}>JAM</label>
                  <input type="time" value={jam} onChange={e => setJam(e.target.value)} style={inputStyle} required />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', opacity: 0.7 }}>LOKASI</label>
                <input type="text" value={lokasi} onChange={e => setLokasi(e.target.value)} style={inputStyle} required />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', opacity: 0.7 }}>GAMBAR THUMBNAIL (OPSIONAL)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setImageFile(e.target.files?.[0] || null)} 
                    style={{ ...inputStyle, padding: '0.5rem' }} 
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }}></div>
                    </div>
                  )}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  width: '100%', padding: '1.125rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', 
                  fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                  boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
                }}
              >
                {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN EVENT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Event */}
      {isDetailModalOpen && activeEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '800px', height: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
            <button onClick={() => setIsDetailModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}>
              <X size={20} />
            </button>
            
            {/* Top Info Section - Updated for better contrast & Thumbnail Support */}
            <div style={{ 
              padding: '3rem', 
              background: activeEvent.thumbnailUrl 
                ? `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${activeEvent.thumbnailUrl}) center/cover no-repeat`
                : 'linear-gradient(135deg, #1e293b, #0f172a)', 
              borderBottom: '1px solid var(--border)',
              position: 'relative'
            }}>
              {canPerformAction(currentUser?.role || 'Guest', '/event', 'edit') && (
                <button 
                  onClick={() => {
                    setAgenda(activeEvent.agenda); setTanggal(activeEvent.tanggal); setJam(activeEvent.jam); setLokasi(activeEvent.lokasi);
                    setIsEditing(true); setEditingId(activeEvent.id);
                    setIsAddModalOpen(true);
                  }}
                  style={{ position: 'absolute', bottom: '2rem', right: '3rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Edit3 size={16} /> EDIT EVENT
                </button>
              )}
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white' }}>{activeEvent.agenda}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div style={detailItemStyle}>
                  <Calendar size={18} color="var(--primary)" />
                  <div>
                    <div style={detailLabelStyle}>HARI / TANGGAL</div>
                    <div style={detailValueStyle}>{getDayName(activeEvent.tanggal)}, {formatDate(activeEvent.tanggal)}</div>
                  </div>
                </div>
                <div style={detailItemStyle}>
                  <Clock size={18} color="var(--primary)" />
                  <div>
                    <div style={detailLabelStyle}>WAKTU</div>
                    <div style={detailValueStyle}>{activeEvent.jam} WIB</div>
                  </div>
                </div>
                <div style={detailItemStyle}>
                  <MapPin size={18} color="var(--primary)" />
                  <div>
                    <div style={detailLabelStyle}>LOKASI</div>
                    <div style={detailValueStyle}>{activeEvent.lokasi}</div>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div style={{ marginTop: '2.5rem' }}>
                <Countdown targetDate={`${activeEvent.tanggal}T${activeEvent.jam}`} />
              </div>
            </div>

            {/* Bottom Content (Participants) */}
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
              
              {/* Participant List */}
              <div style={{ gridColumn: isAddingParticipant ? 'auto' : '1/-1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                    <List size={20} color="var(--primary)" /> DAFTAR PESERTA
                  </h3>
                  {!isAddingParticipant && canAddEvent && (
                    <button 
                      onClick={() => setIsAddingParticipant(true)}
                      style={{ padding: '0.6rem 1rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Plus size={14} /> TAMBAH PESERTA
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isAddingParticipant ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
                  {activeEvent.participants ? Object.values(activeEvent.participants).map(p => (
                    <div key={p.id} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         {p.nama.toUpperCase()}
                         {canPerformAction(currentUser?.role || 'Guest', '/event', 'delete') && (
                           <button onClick={() => handleDeleteParticipant(activeEvent.id, p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.4, cursor: 'pointer' }}><Trash2 size={14} /></button>
                         )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={14} /> {p.nomorPonsel}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                        <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> {p.alamat}
                      </div>
                    </div>
                  )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', opacity: 0.4, fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                       Belum ada peserta terdaftar.
                    </div>
                  )}
                </div>
              </div>

              {/* Participant Form Overlay/Section */}
              {isAddingParticipant && (
                <div className="animate-slide-up" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--primary)', height: 'fit-content' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>ISI DATA PESERTA</h3>
                    <X size={18} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsAddingParticipant(false)} />
                  </div>
                  <form onSubmit={(e) => { handleAddParticipant(e); setIsAddingParticipant(false); }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.3rem', opacity: 0.6 }}>NAMA LENGKAP</label>
                      <input type="text" placeholder="Nama..." value={pNama} onChange={e => setPNama(e.target.value)} style={inputStyle} required />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.3rem', opacity: 0.6 }}>NOMOR PONSEL</label>
                      <input type="tel" placeholder="08..." value={pNomor} onChange={e => setPNomor(e.target.value)} style={inputStyle} required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.3rem', opacity: 0.6 }}>ALAMAT ASAL</label>
                      <textarea placeholder="Alamat lengkap..." value={pAlamat} onChange={e => setPAlamat(e.target.value)} style={{...inputStyle, resize: 'none'}} rows={2} required />
                    </div>
                    <button 
                      type="submit" 
                      style={{ 
                        width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', 
                        fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }}
                    >
                      SIMPAN PESERTA
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function MiniCountdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate);
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const unitStyle = { fontSize: '0.65rem', fontWeight: 900, color: 'white' };
  const labelMiniStyle = { fontSize: '0.4rem', color: 'rgba(255,255,255,0.6)', fontWeight: 800, marginTop: '-2px' };

  if (!timeLeft) return (
    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <CheckCircle2 size={10} /> KEGIATAN SELESAI
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={unitStyle}>{timeLeft.d}d</span>
          <span style={labelMiniStyle}>HARI</span>
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={unitStyle}>{timeLeft.h}h</span>
          <span style={labelMiniStyle}>JAM</span>
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={unitStyle}>{timeLeft.m}m</span>
          <span style={labelMiniStyle}>MENIT</span>
       </div>
       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={unitStyle}>{timeLeft.s}s</span>
          <span style={labelMiniStyle}>DETIK</span>
       </div>
    </div>
  );
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate);
      const now = new Date().getTime();
      const distance = target.getTime() - now;

      if (distance < 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderRadius: '50px', fontWeight: 900, letterSpacing: '1px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
      <CheckCircle2 size={16} /> KEGIATAN INI TELAH SELESAI
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={cdBoxStyle}>
        <div style={cdValueStyle}>{timeLeft.d.toString().padStart(2, '0')}</div>
        <div style={cdLabelStyle}>HARI</div>
      </div>
      <div style={cdBoxStyle}>
        <div style={cdValueStyle}>{timeLeft.h.toString().padStart(2, '0')}</div>
        <div style={cdLabelStyle}>JAM</div>
      </div>
      <div style={cdBoxStyle}>
        <div style={cdValueStyle}>{timeLeft.m.toString().padStart(2, '0')}</div>
        <div style={cdLabelStyle}>MENIT</div>
      </div>
      <div style={cdBoxStyle}>
        <div style={cdValueStyle}>{timeLeft.s.toString().padStart(2, '0')}</div>
        <div style={cdLabelStyle}>DETIK</div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.875rem 1.25rem',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text-main)',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s'
};

const detailItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  background: 'rgba(255,255,255,0.08)',
  padding: '1.25rem',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.15)',
  backdropFilter: 'blur(4px)'
};

const detailLabelStyle = {
  fontSize: '0.7rem',
  fontWeight: 800,
  color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.05em',
  marginBottom: '2px'
};

const detailValueStyle = {
  fontSize: '1rem',
  fontWeight: 800,
  color: 'white'
};

const cdBoxStyle: React.CSSProperties = {
  background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '20px',
  padding: '1rem 1.5rem',
  textAlign: 'center',
  minWidth: '85px',
  backdropFilter: 'blur(8px)'
};

const cdValueStyle = {
  fontSize: '1.75rem',
  fontWeight: 900,
  color: 'white',
  lineHeight: 1
};

const cdLabelStyle = {
  fontSize: '0.65rem',
  fontWeight: 800,
  color: 'rgba(255,255,255,0.4)',
  marginTop: '0.4rem',
  letterSpacing: '0.1em'
};
