
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { ref, push, set, onValue } from 'firebase/database';
import { Calendar, Plus, Clock, MapPin, X, AlertCircle, CheckCircle2, List } from 'lucide-react';
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
  createdAt: number;
  participants?: Record<string, Participant>;
}

export default function Event() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    try {
      const newRef = push(ref(db, 'events'));
      const newEvent: EventData = {
        id: newRef.key as string,
        agenda,
        tanggal,
        jam,
        lokasi,
        createdAt: new Date().getTime()
      };
      await set(newRef, newEvent);
      setStatus({ type: 'success', msg: 'Event berhasil ditambahkan!' });
      setAgenda(''); setTanggal(''); setJam(''); setLokasi('');
      setTimeout(() => { setIsAddModalOpen(false); setStatus(null); }, 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Gagal menambah event.' });
    }
    setIsSubmitting(false);
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !pNama || !pNomor || !pAlamat) return;
    
    try {
      const pRef = push(ref(db, `events/${selectedEvent.id}/participants`));
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
            onClick={() => setIsAddModalOpen(true)}
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

      {/* Grid List */}
      <div className="dashboard-grid">
        {events.length > 0 ? events.map(ev => (
          <div 
            key={ev.id} 
            className="glass-card" 
            style={{ padding: '1.5rem', cursor: 'pointer' }}
            onClick={() => { setSelectedEvent(ev); setIsDetailModalOpen(true); }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: '0.75rem', borderRadius: '14px' }}>
                <Calendar size={24} />
              </div>
              <div style={{ background: 'rgba(0,0,0,0.05)', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 800, opacity: 0.6 }}>
                 JADWAL AKTIF
              </div>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>{ev.agenda}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Clock size={16} />
              {formatDate(ev.tanggal)} • {ev.jam}
            </div>
          </div>
        )) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <Calendar size={48} style={{ marginBottom: '1rem' }} />
            <p>Belum ada kegiatan terdaftar.</p>
          </div>
        )}
      </div>

      {/* Modal Tambah Event */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '32px', position: 'relative' }}>
            <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '2rem', textAlign: 'center' }}>TAMBAH KEGIATAN</h2>
            
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
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.4rem', opacity: 0.7 }}>LOKASI</label>
                <input type="text" value={lokasi} onChange={e => setLokasi(e.target.value)} style={inputStyle} required />
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
            
            {/* Top Info Section */}
            <div style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(16, 185, 129, 0.2))', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem' }}>{activeEvent.agenda}</h2>
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
                
                <div style={{ display: 'grid', gridTemplateColumns: isAddingParticipant ? '1fr' : 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                  {activeEvent.participants ? Object.values(activeEvent.participants).map(p => (
                    <div key={p.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{p.nama.toUpperCase()}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, color: 'var(--text-muted)' }}>📞 {p.nomorPonsel}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, color: 'var(--text-muted)', marginTop: '0.2rem' }}>📍 {p.alamat}</div>
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
    <div style={{ display: 'inline-flex', padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '50px', fontWeight: 900, letterSpacing: '1px', fontSize: '0.75rem' }}>
      EVENT TELAH SELESAI / SEDANG BERLANGSUNG
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
  background: 'rgba(255,255,255,0.05)',
  padding: '1rem 1.25rem',
  borderRadius: '20px',
  border: '1px solid var(--border)'
};

const detailLabelStyle = {
  fontSize: '0.65rem',
  fontWeight: 800,
  color: 'var(--text-muted)',
  letterSpacing: '0.5px'
};

const detailValueStyle = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: 'var(--text-main)'
};

const cdBoxStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '16px',
  padding: '0.75rem 1.25rem',
  textAlign: 'center',
  minWidth: '70px'
};

const cdValueStyle = {
  fontSize: '1.5rem',
  fontWeight: 900,
  color: 'white'
};

const cdLabelStyle = {
  fontSize: '0.55rem',
  fontWeight: 800,
  opacity: 0.6,
  marginTop: '0.2rem'
};
