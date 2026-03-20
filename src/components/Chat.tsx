import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';

export default function Chat() {
  const { currentUser, users } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter users to exclude current user
  const otherUsers = users.filter(u => u.id !== currentUser?.id);
  const filteredUsers = otherUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Real-time messages listener
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const chatId = [currentUser.id, selectedUser.id].sort().join('_');
    const messagesRef = ref(db, `messages/${chatId}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setMessages(msgList);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !currentUser) return;

    const chatId = [currentUser.id, selectedUser.id].sort().join('_');
    const messagesRef = ref(db, `messages/${chatId}`);

    await push(messagesRef, {
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId: selectedUser.id,
      text: inputText,
      timestamp: serverTimestamp()
    });

    setInputText('');
  };

  if (!currentUser) return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chat-bubble-active"
          style={{
            width: '60px', height: '60px', borderRadius: '30px', background: 'var(--primary)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)', border: 'none', cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
        >
          <MessageSquare size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="glass-card animate-slide-up" style={{
          width: '380px', height: '550px', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '1rem 1.5rem', background: 'var(--primary)', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {selectedUser ? (
                <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                  ←
                </button>
              ) : <MessageSquare size={20} />}
              <span style={{ fontWeight: 700 }}>{selectedUser ? selectedUser.name : 'Diskusi Pengguna'}</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {!selectedUser ? (
            /* Contact List View */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input
                    type="text"
                    placeholder="Cari pengguna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'white', outline: 'none', fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem' }}>
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                      borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s',
                      marginBottom: '0.25rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                    }}>
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation View */
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.3)' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Belum ada pesan. Mulai percakapan dengan {selectedUser.name}.
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                      maxWidth: '80%', display: 'flex', flexDirection: 'column',
                      alignItems: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      padding: '0.75rem 1rem', borderRadius: '15px',
                      borderBottomLeftRadius: msg.senderId === currentUser.id ? '15px' : '2px',
                      borderBottomRightRadius: msg.senderId === currentUser.id ? '2px' : '15px',
                      background: msg.senderId === currentUser.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: 'white', fontSize: '0.9rem', lineHeight: '1.4',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1, padding: '0.75rem 1rem', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    width: '45px', height: '45px', borderRadius: '12px', background: 'var(--primary)',
                    color: 'white', border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', opacity: inputText.trim() ? 1 : 0.5
                  }}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
