import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Search, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { ref, onValue } from 'firebase/database';

export default function Chat() {
  const { currentUser, users } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter users to exclude current user
  const otherUsers = users.filter(u => u.id !== currentUser?.id);
  const filteredUsers = otherUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Unread messages listener
  useEffect(() => {
    if (!currentUser) return;
    const unreadRef = ref(db, `unread/${currentUser.id}`);
    const unsubscribe = onValue(unreadRef, (snapshot) => {
      setHasUnread(snapshot.exists());
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Real-time messages listener
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const chatId = [currentUser.id, selectedUser.id].sort().join('_');
    const messagesRef = ref(db, `messages/${chatId}`);
    
    // Mark as read when opening
    if (isOpen) {
      import('firebase/database').then(({ set, ref: dbRef }) => {
        set(dbRef(db, `unread/${currentUser.id}/${chatId}`), null);
      });
    }

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
  }, [selectedUser, currentUser, isOpen]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUser || !currentUser) return;

    const chatId = [currentUser.id, selectedUser.id].sort().join('_');
    const messagesRef = ref(db, `messages/${chatId}`);
    const unreadRef = ref(db, `unread/${selectedUser.id}/${chatId}`);

    await import('firebase/database').then(async ({ push, set, serverTimestamp }) => {
      await push(messagesRef, {
        senderId: currentUser.id,
        senderName: currentUser.name,
        receiverId: selectedUser.id,
        text: inputText,
        timestamp: serverTimestamp()
      });
      await set(unreadRef, true);
    });

    setInputText('');
  };

  if (!currentUser) return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000 }}>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <div style={{ position: 'relative' }}>
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
          {hasUnread && (
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '18px', height: '18px',
              background: '#ef4444', borderRadius: '50%', border: '2px solid white',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }} />
          )}
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="animate-slide-up chat-window-container" style={{
          width: '380px', height: '550px', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid var(--border)',
          background: 'white', borderRadius: '24px'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '1.25rem 1.5rem', background: 'var(--primary)', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {selectedUser ? (
                <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}>
                  ←
                </button>
              ) : <MessageSquare size={20} />}
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>{selectedUser ? selectedUser.name : 'Pusat Diskusi'}</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
              <X size={20} />
            </button>
          </div>

          {!selectedUser ? (
            /* Contact List View */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
              <div style={{ padding: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4, color: '#000' }} />
                  <input
                    type="text"
                    placeholder="Cari pengguna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '14px',
                      background: 'white', border: '1px solid var(--border)',
                      color: '#1a1a1a', outline: 'none', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  />
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem 1rem 0.75rem' }}>
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                      borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s',
                      marginBottom: '0.5rem', background: 'white', border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
                    }}>
                      <UserIcon size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{user.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation View */
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fdfdfd' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '2rem', color: '#9ca3af', fontSize: '0.85rem', padding: '0 2rem' }}>
                    Sapa {selectedUser.name} dengan pesan pertama Anda!
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                      maxWidth: '85%', display: 'flex', flexDirection: 'column',
                      alignItems: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      padding: '0.75rem 1.1rem', borderRadius: '18px',
                      borderBottomLeftRadius: msg.senderId === currentUser.id ? '18px' : '4px',
                      borderBottomRightRadius: msg.senderId === currentUser.id ? '4px' : '18px',
                      background: msg.senderId === currentUser.id ? 'var(--primary)' : '#f3f4f6',
                      color: msg.senderId === currentUser.id ? 'white' : '#1f2937', 
                      fontSize: '0.95rem', lineHeight: '1.5', fontWeight: 500,
                      boxShadow: msg.senderId === currentUser.id ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none'
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.4rem', fontWeight: 500 }}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', background: 'white', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Tulis pesan..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1, padding: '0.85rem 1.25rem', borderRadius: '14px',
                    background: '#f9fafb', border: '1px solid #e5e7eb',
                    color: '#1a1a1a', outline: 'none', transition: 'all 0.2s',
                    fontSize: '0.95rem'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  style={{
                    width: '50px', height: '50px', borderRadius: '14px', background: 'var(--primary)',
                    color: 'white', border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
