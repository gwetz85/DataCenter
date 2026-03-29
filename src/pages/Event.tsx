
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { ref, push, set, onValue, remove, update } from 'firebase/database';
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

  // Form states for adding/editing event
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

  // Image state
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(event.target?.result as string);
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
      };
    });
  };

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
      
      if (imageFile) {
        setUploadProgress(10);
        thumbnailUrl = await compressImage(imageFile);
        setUploadProgress(100);
      }

      const eventDataToSave = { agenda, tanggal, jam, lokasi, thumbnailUrl };

      if (isEditing && editingId) {
        await update(ref(db, `events/${editingId}`), eventDataToSave);
        setStatus({ type: 'success', msg: 'Event berhasil diperbarui!' });
      } else {
        const newRef = push(ref(db, 'events'));
        const newEvent: EventData = {
          id: newRef.key as string,
          ...eventDataToSave,
          createdAt: new Date().getTime()
        };
        await set(newRef, newEvent);
        setStatus({ type: 'success', msg: 'Event berhasil ditambahkan!' });
      }

      setAgenda(''); setTanggal(''); setJam(''); setLokasi(''); setImageFile(null); setUploadProgress(0);
      setTimeout(() => { setIsAddModalOpen(false); setStatus(null); setIsEditing(false); setEditingId(null); }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Gagal memproses event.' });
    } finally {
      setIsSubmitting(false);
    }
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

  const handleDeleteEvent = async (id: string) => {
    if (!window.confirm('Hapus event ini secara permanen?')) return;
    try {
      await remove(ref(db, `events/${id}`));
      if (selectedEvent?.id === id) setIsDetailModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteParticipant = async (eventId: string, pId: string) => {
    if (!window.confirm('Hapus peserta ini?')) return;
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
      <div className="responsive-layout-split" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="mobile-text-responsive-h1" style={{ 
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '20px', width: 'fit-content', border: '1px solid var(--border)' }}>
        <button onClick={() => setActiveTab('Aktif')} style={{ padding: '0.6rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', background: activeTab === 'Aktif' ? 'var(--primary)' : 'transparent', color: activeTab === 'Aktif' ? 'white' : 'var(--text-muted)', transition: 'all 0.3s' }}>KEGIATAN AKTIF</button>
        <button onClick={() => setActiveTab('Arsip')} style={{ padding: '0.6rem 1.5rem', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', background: activeTab === 'Arsip' ? 'var(--surface-hover)' : 'transparent', color: activeTab === 'Arsip' ? 'var(--text-main)' : 'var(--text-muted)', transition: 'all 0.3s' }}>ARSIP KEGIATAN</button>
      </div>

      {/* Grid */}
      <div className="dashboard-grid">
        {filteredEvents.length > 0 ? filteredEvents.map(ev => {
          const pCount = ev.participants ? Object.keys(ev.participants).length : 0;
          return (
            <div key={ev.id} className="glass-card" style={{ padding: '0', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }} onClick={() => { setSelectedEvent(ev); setIsDetailModalOpen(true); }}>
              <div style={{ height: '140px', background: ev.thumbnailUrl ? `url(${ev.thumbnailUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #a855f7)', position: 'relative' }}>
                 {!ev.thumbnailUrl && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', opacity: 0.5 }}><ImageIcon size={40} /></div>}
                 <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 800, color: 'white' }}>{activeTab === 'Aktif' ? 'AKTIF' : 'SELESAI'}</div>
                    {canPerformAction(currentUser?.role || 'Guest', '/event', 'edit') && (
                      <button onClick={(e) => { e.stopPropagation(); setAgenda(ev.agenda); setTanggal(ev.tanggal); setJam(ev.jam); setLokasi(ev.lokasi); setIsEditing(true); setEditingId(ev.id); setIsAddModalOpen(true); }} style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem', borderRadius: '50%', color: 'white', cursor: 'pointer' }}><Edit3 size={14} /></button>
                    )}
                    {canPerformAction(currentUser?.role || 'Guest', '/event', 'delete') && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }} style={{ background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.4rem', borderRadius: '50%', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                    )}
                 </div>
                 <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1rem 1.5rem 0.75rem 1.5rem' }}>
                   <MiniCountdown targetDate={`${ev.tanggal}T${ev.jam}`} />
                 </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0', color: 'var(--text-main)', lineBreak: 'anywhere', flex: 1 }}>{ev.agenda}</h3>
                  <div style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, marginLeft: '0.5rem' }}>{pCount} PESERTA</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}><Calendar size={14} />{getDayName(ev.tanggal)}, {formatDate(ev.tanggal)} • {ev.jam}</div>
              </div>
            </div>
          );
        }) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}><Calendar size={48} style={{ marginBottom: '1rem' }} /><p>Belum ada kegiatan {activeTab === 'Aktif' ? 'terdaftar' : 'di arsip'}.</p></div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '32px', position: 'relative' }}>
            <button onClick={() => { setIsAddModalOpen(false); setIsEditing(false); setEditingId(null); }} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem', textAlign: 'center' }}>{isEditing ? 'EDIT KEGIATAN' : 'TAMBAH KEGIATAN'}</h2>
            {status && <div style={{ padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: status.type === 'error' ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>{status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}{status.msg}</div>}
            <form onSubmit={handleAddEvent}>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>AGENDA</label><input type="text" value={agenda} onChange={e => setAgenda(e.target.value)} style={inputStyle} required /></div>
              <div className="responsive-grid-3" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                <div><label style={labelStyle}>TANGGAL</label><input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} style={inputStyle} required /></div>
                <div><label style={labelStyle}>JAM</label><input type="time" value={jam} onChange={e => setJam(e.target.value)} style={inputStyle} required /></div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}><label style={labelStyle}>LOKASI</label><input type="text" value={lokasi} onChange={e => setLokasi(e.target.value)} style={inputStyle} required /></div>
              <div style={{ marginBottom: '2rem' }}><label style={labelStyle}>GAMBAR THUMBNAIL (OPSIONAL)</label><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: '0.5rem' }} />{uploadProgress > 0 && uploadProgress < 100 && <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}><div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s' }}></div></div>}</div>
              <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1.125rem', borderRadius: '16px', background: 'var(--primary)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}>{isSubmitting ? 'MENYIMPAN...' : 'SIMPAN EVENT'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && activeEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '800px', height: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
            <button onClick={() => setIsDetailModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', zIndex: 10 }}><X size={20} /></button>
            <div className="responsive-padding-large" style={{ background: activeEvent.thumbnailUrl ? `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url(${activeEvent.thumbnailUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #1e293b, #0f172a)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
              {canAddEvent && <button onClick={() => { setAgenda(activeEvent.agenda); setTanggal(activeEvent.tanggal); setJam(activeEvent.jam); setLokasi(activeEvent.lokasi); setIsEditing(true); setEditingId(activeEvent.id); setIsAddModalOpen(true); }} style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit3 size={16} /> EDIT</button>}
              <h2 className="mobile-text-responsive-h1" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'white', lineHeight: 1.2 }}>{activeEvent.agenda}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="event-detail-item"><Calendar size={18} color="var(--primary)" /><div><div style={detailLabelStyle}>HARI / TANGGAL</div><div style={detailValueStyle}>{getDayName(activeEvent.tanggal)}, {formatDate(activeEvent.tanggal)}</div></div></div>
                <div className="event-detail-item"><Clock size={18} color="var(--primary)" /><div><div style={detailLabelStyle}>WAKTU</div><div style={detailValueStyle}>{activeEvent.jam} WIB</div></div></div>
                <div className="event-detail-item"><MapPin size={18} color="var(--primary)" /><div><div style={detailLabelStyle}>LOKASI</div><div style={detailValueStyle}>{activeEvent.lokasi}</div></div></div>
              </div>
              <div style={{ marginTop: '2rem' }}><Countdown targetDate={`${activeEvent.tanggal}T${activeEvent.jam}`} /></div>
            </div>
            <div className="responsive-modal-participant-grid" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: isAddingParticipant ? '1.5fr 1fr' : '1fr', gap: isAddingParticipant ? '2rem' : '0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}><h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}><List size={20} color="var(--primary)" /> DAFTAR PESERTA</h3>{!isAddingParticipant && canAddEvent && <button onClick={() => setIsAddingParticipant(true)} style={{ padding: '0.6rem 1rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Plus size={14} /> TAMBAH PESERTA</button>}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>{activeEvent.participants ? Object.values(activeEvent.participants).map(p => (<div key={p.id} style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}><div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{p.nama.toUpperCase()}{canAddEvent && <button onClick={() => handleDeleteParticipant(activeEvent.id, p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.4, cursor: 'pointer' }}><Trash2 size={14} /></button>}</div><div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {p.nomorPonsel}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><MapPin size={14} style={{ marginTop: '2px' }} /> {p.alamat}</div></div>)) : <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.4, fontSize: '0.85rem' }}>Belum ada peserta terdaftar.</div>}</div>
              </div>
              {isAddingParticipant && (
                <div className="animate-slide-up" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--primary)', height: 'fit-content' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}><h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>ISI DATA PESERTA</h3><X size={18} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsAddingParticipant(false)} /></div>
                  <form onSubmit={(e) => { handleAddParticipant(e); setIsAddingParticipant(false); }}><div style={{ marginBottom: '1rem' }}><label style={labelStyleSmall}>NAMA LENGKAP</label><input type="text" placeholder="Nama..." value={pNama} onChange={e => setPNama(e.target.value)} style={inputStyle} required /></div><div style={{ marginBottom: '1rem' }}><label style={labelStyleSmall}>NOMOR PONSEL</label><input type="tel" placeholder="08..." value={pNomor} onChange={e => setPNomor(e.target.value)} style={inputStyle} required /></div><div style={{ marginBottom: '1.5rem' }}><label style={labelStyleSmall}>ALAMAT ASAL</label><textarea placeholder="Alamat lengkap..." value={pAlamat} onChange={e => setPAlamat(e.target.value)} style={{ ...inputStyle, resize: 'none' }} rows={2} required /></div><button type="submit" style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', background: 'var(--primary)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }}>SIMPAN PESERTA</button></form>
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
      const distance = target.getTime() - new Date().getTime();
      if (distance < 0) { setTimeLeft(null); clearInterval(timer); }
      else { setTimeLeft({ d: Math.floor(distance / (1000 * 60 * 60 * 24)), h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), s: Math.floor((distance % (1000 * 60)) / 1000) }); }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  if (!timeLeft) return <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle2 size={10} /> KEGIATAN SELESAI</div>;
  return <div style={{ display: 'flex', gap: '0.75rem' }}>{['d', 'h', 'm', 's'].map((u, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white' }}>{timeLeft[u as keyof typeof timeLeft]}{u}</span><span style={{ fontSize: '0.4rem', color: 'rgba(255,255,255,0.6)', fontWeight: 800, marginTop: '-2px' }}>{['HARI', 'JAM', 'MENIT', 'DETIK'][i]}</span></div>)}</div>;
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);
  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate);
      const distance = target.getTime() - new Date().getTime();
      if (distance < 0) { setTimeLeft(null); clearInterval(timer); }
      else { setTimeLeft({ d: Math.floor(distance / (1000 * 60 * 60 * 24)), h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), s: Math.floor((distance % (1000 * 60)) / 1000) }); }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  if (!timeLeft) return <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderRadius: '50px', fontWeight: 900, letterSpacing: '1px', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}><CheckCircle2 size={16} /> KEGIATAN INI TELAH SELESAI</div>;
  return (
    <div className="countdown-wrapper" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
      {['d', 'h', 'm', 's'].map((u, i) => (
        <div key={i} className="countdown-item">
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', lineHeight: 1 }}>{timeLeft[u as keyof typeof timeLeft].toString().padStart(2, '0')}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>{['HARI', 'JAM', 'MENIT', 'DETIK'][i]}</div>
        </div>
      ))}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0.875rem 1.25rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none' };
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', opacity: 0.7 };
const labelStyleSmall = { display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.3rem', opacity: 0.6 };
const detailLabelStyle = { fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', marginBottom: '2px' };
const detailValueStyle = { fontSize: '1rem', fontWeight: 800, color: 'white' };
