import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import { MessageSquare, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ChatMonitoring() {
  const { users, currentUser } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessionList = Object.keys(data).map(chatId => {
          const msgs = Object.values(data[chatId]);
          const lastMsg: any = msgs[msgs.length - 1];
          
          // Try to decode participant names from chatId or messages
          const participants = chatId.split('_');
          const user1 = users.find(u => u.id === participants[0])?.name || participants[0];
          const user2 = users.find(u => u.id === participants[1])?.name || participants[1];

          return {
            id: chatId,
            user1,
            user2,
            lastMessage: lastMsg.text,
            timestamp: lastMsg.timestamp,
            messages: msgs
          };
        }).sort((a, b) => b.timestamp - a.timestamp);
        
        setSessions(sessionList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [users]);

  if (currentUser?.role !== 'Admin') {
    return (
      <div style={{ textAlign: 'center', padding: '5rem' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2>Akses Ditolak</h2>
        <p>Hanya Admin yang dapat mengakses halaman monitoring chat.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: 900 }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '16px', display: 'flex' }}>
            <MessageSquare size={32} />
          </div>
          Monitoring Chat
        </h1>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Audit seluruh percakapan antar pengguna aplikasi secara real-time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: '70vh' }}>
        {/* Session List */}
        <div className="glass-card" style={{ overflowY: 'auto', padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.5rem', padding: '0 0.5rem' }}>Sesi Aktif</h3>
          {sessions.length === 0 && !loading && <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada obrolan.</div>}
          {sessions.map(session => (
            <div
              key={session.id}
              onClick={() => setSelectedSessionId(session.id)}
              style={{
                padding: '1rem', borderRadius: '12px', cursor: 'pointer', marginBottom: '0.5rem',
                border: selectedSessionId === session.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
                background: selectedSessionId === session.id ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.02)'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{session.user1} ↔ {session.user2}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {session.lastMessage}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 600 }}>
                {new Date(session.timestamp).toLocaleString('id-ID')}
              </div>
            </div>
          ))}
        </div>

        {/* Content Viewer */}
        <div className="glass-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selectedSessionId ? (
            <>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ margin: 0 }}>Detail Percakapan</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedSessionId}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {sessions.find(s => s.id === selectedSessionId)?.messages.map((msg: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>{msg.senderName}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(msg.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid var(--primary)', fontSize: '0.95rem' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <ShieldAlert size={64} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>Pilih salah satu sesi untuk melihat detail pesan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
