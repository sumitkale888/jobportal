import React, { useEffect, useState, useRef } from 'react';
import { getMyMessages, getConversation, sendChatMessage, getChatMe } from '../api/recruiterApi';
import axiosInstance from '../api/axiosInstance';
import Navbar from './Navbar';
import { toast } from 'react-toastify';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const { setChatUnreadCount } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const selectedContactIdRef = useRef(null);
  const [conversation, setConversation] = useState([]);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const seenMessageIdsRef = useRef(new Set());

  const appendMessageIfMissing = (message) => {
    setConversation((prev) => {
      if (!message?.id) return [...prev, message];
      if (prev.some((m) => m?.id === message.id)) return prev;
      return [...prev, message];
    });
  };

  // Track browser tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Build contacts list from messages using isRead and message direction
  const buildContacts = (messages, userId) => {
    console.log('👥 buildContacts called with', messages.length, 'messages, userId:', userId);
    const map = new Map();
    messages.forEach((m, idx) => {
      console.log(`  [${idx}] msg from ${m.senderId} to ${m.recipientId}: "${m.content.substring(0, 30)}..."`);
      
      // Ignore invalid self-to-self messages
      if (m.senderId === m.recipientId && m.senderId === userId) {
        console.log(`    ⚠️ Skipped: self-to-self message`);
        return;
      }
      
      const isCurrentUserSender = m.senderId === userId;
      const otherId = isCurrentUserSender ? m.recipientId : m.senderId;
      const otherEmail = isCurrentUserSender ? m.recipientEmail : m.senderEmail;

      if (!otherId || otherId === userId) {
        console.log(`    ⚠️ Skipped: invalid otherId or self message`);
        return;
      }

      console.log(`    ✅ Processing: otherId=${otherId}, email=${otherEmail}, isCurrentUserSender=${isCurrentUserSender}`);

      const previous = map.get(otherId);
      if (!previous || new Date(m.sentAt) > new Date(previous.sentAt)) {
        // Show unread badge ONLY if:
        // 1. Message is sent TO current user (they didn't send it)
        // 2. AND the message is marked as unread (!isRead)
        const isUnread = !isCurrentUserSender && m.isRead === false;

        console.log(`    📍 Added to map: otherId=${otherId}, isUnread=${isUnread}`);

        map.set(otherId, {
          id: otherId,
          email: otherEmail || previous?.email || 'Unknown',
          lastMessage: m.content,
          sentAt: m.sentAt,
          lastSenderId: m.senderId,
          unread: isUnread,
        });
      } else {
        console.log(`    ⏭️ Skipped: older message than current`);
      }
    });
    const result = Array.from(map.values())
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    console.log('👥 buildContacts result:', result.length, 'contacts');
    result.forEach(c => console.log(`    - ${c.email} (unread: ${c.unread})`));
    return result;
  };

  // Mark messages as read on backend
  const markMessagesAsReadOnBackend = async (senderId) => {
    try {
      await axiosInstance.post('/chat/mark-as-read', { senderId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const loadConversation = async (contactId) => {
    try {
      console.log('📥 Loading conversation for contact:', contactId);
      const conv = await getConversation(contactId);
      console.log('📥 Got conversation, length:', conv?.length || 0);
      if (conv && conv.length > 0) {
        console.log('  Messages in conversation:');
        conv.forEach((m, idx) => {
          console.log(`    [${idx}] id=${m.id}, senderId=${m.senderId}, sentAt=${m.sentAt}, content="${m.content.substring(0, 30)}..."`);
        });
      }
      
      setConversation(conv || []);
      setSelectedContactId(contactId);
      selectedContactIdRef.current = contactId;
      console.log('✅ setConversation and setSelectedContactId updated');

      // Mark unread messages from this contact as read on backend
      await markMessagesAsReadOnBackend(contactId);

      // Update contacts to mark this one as read
      setContacts((prev) => {
        const next = prev.map((c) => (c.id === contactId ? { ...c, unread: false } : c));
        if (setChatUnreadCount) {
          setChatUnreadCount(next.filter((c) => c.unread).length);
        }
        return next;
      });
      console.log('✅ loadConversation completed successfully');
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
      toast.error('Could not load conversation.');
    }
  };

  // Initial load of chat data
  useEffect(() => {
    console.log('🔄 Chat component mounted, loading initial data...');
    const run = async () => {
      try {
        const user = await getChatMe();
        console.log('👤 Current user:', user);
        setCurrentUser(user);
        
        const msgs = await getMyMessages();
        console.log('📬 All messages loaded:', msgs.length > 0 ? msgs.length + ' messages' : 'No messages');
        
        const built = buildContacts(msgs, user.id);
        console.log('👥 Contacts built:', built.length);
        console.log('  Contacts:', built.map(c => ({ id: c.id, email: c.email })));
        
        setContacts(built);
        if (setChatUnreadCount) {
          const unreadCount = built.filter((c) => c.unread).length;
          console.log('🔴 Unread count:', unreadCount);
          setChatUnreadCount(unreadCount);
        }
        
        if (built.length > 0) {
          const firstId = built[0].id;
          console.log('📌 Loading first contact:', firstId);
          await loadConversation(firstId);
        }
      } catch (error) {
        console.error('❌ Error loading chat data:', error);
        toast.error('Could not load chat data.');
      }
    };
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync unread count when contacts change
  useEffect(() => {
    if (setChatUnreadCount) {
      setChatUnreadCount(contacts.filter((c) => c.unread).length);
    }
  }, [contacts, setChatUnreadCount]);

  // Update selected contact ref
  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);

  useEffect(() => {
    console.log('🔄 Conversation updated, length:', conversation.length);
    conversation.forEach((msg, idx) => {
      console.log(`  [${idx}] From ${msg.senderId}: "${msg.content}" at ${msg.sentAt}`);
    });
    
    if (messagesContainerRef.current) {
      console.log('📜 Scrolling to bottom');
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // WebSocket connection setup
  useEffect(() => {
    if (!currentUser) return;

    const baseWsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8091/ws-chat';
    console.log('🔌 Initializing WebSocket connection to:', baseWsUrl);
    
    // Always clear previous client before creating a new one
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (e) {
        console.warn('⚠️ Failed to deactivate previous client', e);
      }
      stompClientRef.current = null;
    }

    const client = new Client({
      webSocketFactory: () => {
        console.log('🔌 Creating SockJS connection...');
        return new SockJS(baseWsUrl);
      },
      reconnectDelay: 5000,
      maxWebSocketFrameSize: 1024 * 1024,  // Increased to 1MB for larger messages
      debug: (msg) => console.debug('[STOMP]', msg),
      onConnect: () => {
        console.info('✅ STOMP connected for user', currentUser?.id);
        setConnected(true);
        client.subscribe(`/topic/chat/${currentUser.id}`, (frame) => {
          console.info('📨 STOMP frame received');
          console.info('  Frame body:', frame.body);
          try {
            const message = JSON.parse(frame.body);

            if (message?.id && seenMessageIdsRef.current.has(message.id)) {
              console.log('⏭️ Duplicate frame ignored for message id:', message.id);
              return;
            }
            if (message?.id) {
              seenMessageIdsRef.current.add(message.id);
              if (seenMessageIdsRef.current.size > 1000) {
                seenMessageIdsRef.current.clear();
              }
            }

            console.log('📨 Parsed message:', message);
            console.log('  senderId:', message.senderId);
            console.log('  recipientId:', message.recipientId);
            console.log('  content:', message.content);
            console.log('  currentUser.id:', currentUser?.id);
            
            const isCurrentUserSender = message.senderId === currentUser.id;
            const otherId = isCurrentUserSender ? message.recipientId : message.senderId;
            const otherEmail = isCurrentUserSender ? message.recipientEmail : message.senderEmail;
            const incoming = !isCurrentUserSender;

            console.log('  isCurrentUserSender:', isCurrentUserSender);
            console.log('  otherId:', otherId);
            console.log('  incoming:', incoming);

            if (!otherId || otherId === currentUser.id) {
              console.warn('⚠️ Invalid message: selfId or otherId matches currentUser');
              return;
            }

            const activeId = selectedContactIdRef.current;
            const isForActive =
              (message.senderId === activeId && message.recipientId === currentUser.id) ||
              (message.senderId === currentUser.id && message.recipientId === activeId);

            console.log(`💬 Message routing:`);
            console.log(`  activeId (viewing): ${activeId}`); 
            console.log(`  isForActive: ${isForActive}`);

            // Add to conversation if for active contact
            if (isForActive) {
              appendMessageIfMissing(message);
              console.log('✅ Message added to conversation via WebSocket');
            } else {
              console.log('⚙️ Message received but not for active contact, updating contacts list only');
            }

            // If incoming message while viewing that contact AND tab is active, mark as read on backend
            if (incoming && isForActive && isTabActive) {
              axiosInstance.post('/chat/mark-as-read', { senderId: otherId }).catch(e => console.error("Failed to auto-read", e));
            }

            // Update contacts list
            setContacts((prev) => {
              console.log('📋 Updating contacts list');
              const existing = prev.find((c) => c.id === otherId);
              console.log('  Found existing:', existing?.email);
              const next = prev.filter((c) => c.id !== otherId);
              
              // Show red unread indicator ONLY if:
              // 1. Message is incoming (recipient is current user)
              // 2. AND message is marked as unread (isRead === false)
              // 3. AND (we're not viewing that contact OR tab is not active)
              const isUnread = incoming && message.isRead === false && 
                (!isForActive || !isTabActive);

              console.log('  isUnread calculation:');
              console.log('    incoming:', incoming);
              console.log('    isRead:', message.isRead);
              console.log('    !isForActive || !isTabActive:', (!isForActive || !isTabActive));
              console.log('    Result isUnread:', isUnread);

              next.unshift({
                id: otherId,
                email: existing?.email || otherEmail || 'Unknown',
                lastMessage: message.content,
                sentAt: message.sentAt,
                lastSenderId: message.senderId,
                unread: isUnread,
              });
              
              console.log('  Contact moved to top with unread:', isUnread);
              
              if (setChatUnreadCount) {
                setChatUnreadCount(next.filter((c) => c.unread).length);
              }
              return next;
            });
          } catch (e) {
            console.error('❌ Invalid STOMP payload', e);
          }
        });
      },
      onDisconnect: () => {
        console.warn('⚠️ STOMP disconnected');
        setConnected(false);
      },
      onWebSocketError: (err) => {
        console.error('❌ WebSocket error', err);
        setConnected(false);
        // Client will auto-retry with reconnectDelay
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error', frame.headers, frame.body);
        setConnected(false);
      },
      onWebSocketClose: () => {
        console.warn('⚠️ WebSocket closed');
        setConnected(false);
      },
    });

    console.log('🔌 Activating STOMP client');
    client.activate();
    stompClientRef.current = client;

    return () => {
      if (client) {
        client.deactivate();
      }
      if (stompClientRef.current === client) {
        stompClientRef.current = null;
      }
    };
  }, [currentUser]); // Only create connection when user changes, not on every re-render

  const handleSend = async (e) => {
    e.preventDefault();
    console.log('📤 FORM SUBMITTED - handleSend called');
    console.log('  Draft:', draft);
    console.log('  SelectedContactId:', selectedContactId);
    
    if (!draft.trim()) {
      console.warn('⚠️ Draft is empty');
      return;
    }
    if (!selectedContactId) {
      console.warn('⚠️ No contact selected');
      toast.warning('Select a contact first.');
      return;
    }

    try {
      console.log('📤 Sending message to:', selectedContactId, 'Content:', draft.trim());
      const sent = await sendChatMessage(selectedContactId, draft.trim(), null);
      console.log('✅ Message sent successfully from API:', sent);
      console.log('  Full response object:', JSON.stringify(sent, null, 2));
      
      // Validate the response
      if (!sent || !sent.id) {
        console.error('❌ Invalid response from server - missing id:', sent);
        toast.error('Invalid server response - message ID missing');
        return;
      }
      
      if (!sent.sentAt) {
        console.error('❌ Invalid response from server - missing sentAt:', sent);
        toast.error('Invalid server response - timestamp missing');
        return;
      }
      
      console.log('📝 Current state before update:');
      console.log('  conversation before:', conversation.length, 'messages');
      console.log('  selectedContactId:', selectedContactId);
      console.log('  currentUser?.id:', currentUser?.id);
      
      appendMessageIfMissing(sent);
      
      console.log('📝 Called setConversation');
      setDraft('');
      console.log('📝 Called setDraft("")');

      if (sent?.id) {
        seenMessageIdsRef.current.add(sent.id);
      }
      
      setContacts((prev) => {
        console.log('📝 Inside setContacts callback');
        const existing = prev.find((c) => c.id === selectedContactId);
        console.log('  Found existing contact:', existing?.email);
        const next = prev.filter((c) => c.id !== selectedContactId);
        next.unshift({
          id: selectedContactId,
          email: existing?.email || 'Unknown',
          lastMessage: sent.content,
          sentAt: sent.sentAt,
          lastSenderId: currentUser?.id,
          unread: false,
        });
        console.log('  Updated contacts, moved to top');
        return next;
      });
      
      toast.success('✅ Message sent!');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('❌ Error response:', error.response?.data || error.message);
      toast.error('Could not send message: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className='min-h-screen bg-slate-100'>
      <Navbar />
      <div className='max-w-5xl mx-auto p-4'>
        <div className='mb-2 text-right'>
          <span className={`px-2 py-1 rounded ${connected ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-800'}`}>
            {connected ? 'Live connected' : 'Disconnected'}
          </span>
        </div>
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-4 bg-white rounded shadow p-3 h-[600px] overflow-auto'>
            <h2 className='font-semibold text-lg mb-2'>Contacts</h2>
            {contacts.length === 0 && <p className='text-gray-500'>No conversations yet.</p>}
            {contacts.map((c) => (
              <button
                key={c.id}
                className={`w-full text-left border rounded p-2 mb-2 ${selectedContactId === c.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => loadConversation(c.id)}
              >
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{c.email}</span>
                  {c.unread && <span className='h-2 w-2 rounded-full bg-red-500 inline-block' />}
                </div>
                <div className='text-xs text-gray-500'>{c.lastMessage}</div>
              </button>
            ))}
          </div>
          <div className='col-span-8 bg-white rounded shadow p-3 h-[600px] flex flex-col'>
            <div className='mb-2'>
              <h2 className='font-semibold text-lg'>Conversation</h2>
              {selectedContactId ? (
                <p className='text-sm text-gray-500'>
                  Chat with {contacts.find((c) => c.id === selectedContactId)?.email || 'Unknown Contact'}
                </p>
              ) : (
                <p className='text-sm text-gray-500'>Select a contact to chat.</p>
              )}
            </div>
            <div ref={messagesContainerRef} className='flex-1 border rounded p-2 overflow-auto bg-slate-50'>
              {conversation.length === 0 ? (
                <div className='text-gray-500 p-4'>No messages yet.</div>
              ) : (
                conversation.map((m, idx) => {
                  if (!m) {
                    console.warn('⚠️ Message is null or undefined at index:', idx);
                    return null;
                  }
                  
                  if (!m.id || !m.sentAt) {
                    console.warn('⚠️ Message missing required fields:', { id: m.id, sentAt: m.sentAt, content: m.content });
                    return null;
                  }
                  
                  if (!m.content) {
                    console.warn('⚠️ Message missing content:', m);
                    return null;
                  }
                  
                  console.log(`Rendering message [${idx}]:`, { id: m.id, senderId: m.senderId, currentUserId: currentUser?.id, content: m.content, sentAt: m.sentAt });
                  
                  const isMine = currentUser && m.senderId === currentUser.id;
                  return (
                    <div key={`${m.id}-${m.sentAt}`} className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded px-3 py-2 max-w-[80%] ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                        <div>{m.content}</div>
                        <div className='text-xs text-right mt-1 opacity-70'>{new Date(m.sentAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <form onSubmit={handleSend} className='mt-3 flex gap-2'>
              <input type='text' placeholder='Type a message...' className='flex-1 border rounded px-3 py-2 focus:outline-none' value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button className='bg-blue-600 text-white px-4 rounded' type='submit'>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
