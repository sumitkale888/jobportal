import React, { useEffect, useState, useRef } from 'react';
import { getMyMessages, getConversation, sendChatMessage, getChatMe } from '../api/recruiterApi';
import Navbar from './Navbar';
import { toast } from 'react-toastify';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const Chat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const selectedContactIdRef = useRef(null);
  const [conversation, setConversation] = useState([]);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);

  const buildContacts = (messages, userId) => {
    const map = new Map();
    messages.forEach((m) => {
      const otherId = m.senderId === userId ? m.recipientId : m.senderId;
      const otherEmail = m.senderId === userId ? m.recipientEmail : m.senderEmail;
      const previous = map.get(otherId);
      if (!previous || new Date(m.sentAt) > new Date(previous.sentAt)) {
        map.set(otherId, {
          id: otherId,
          email: otherEmail,
          lastMessage: m.content,
          sentAt: m.sentAt,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  };

  const loadConversation = async (contactId) => {
    try {
      const conv = await getConversation(contactId);
      setConversation(conv || []);
      setSelectedContactId(contactId);
      selectedContactIdRef.current = contactId;
    } catch {
      toast.error('Could not load conversation.');
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const user = await getChatMe();
        setCurrentUser(user);
        const msgs = await getMyMessages();
        const built = buildContacts(msgs, user.id);
        setContacts(built);
        if (built.length > 0) {
          const firstId = built[0].id;
          const conv = await getConversation(firstId);
          setConversation(conv || []);
          setSelectedContactId(firstId);
          selectedContactIdRef.current = firstId;
        }
      } catch {
        toast.error('Could not load chat data.');
      }
    };
    run();
  }, []);

  useEffect(() => {
    selectedContactIdRef.current = selectedContactId;
  }, [selectedContactId]);

  useEffect(() => {
    if (!currentUser) return;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8091/ws-chat';
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        console.info('STOMP connected for user', currentUser?.id);
        setConnected(true);
        client.subscribe(`/topic/chat/${currentUser.id}`, (frame) => {
          console.info('STOMP frame received', frame);
          try {
            const message = JSON.parse(frame.body);
            setConversation((prev) => {
              const activeId = selectedContactIdRef.current;
              if (!activeId) return prev;
              const isForActive =
                (message.senderId === activeId && message.recipientId === currentUser.id) ||
                (message.senderId === currentUser.id && message.recipientId === activeId);
              return isForActive ? [...prev, message] : prev;
            });

            setContacts((prev) => {
              const otherId = message.senderId === currentUser.id ? message.recipientId : message.senderId;
              const otherEmail = message.senderId === currentUser.id ? message.recipientEmail : message.senderEmail;
              const existing = prev.find((c) => c.id === otherId);
              const next = prev.filter((c) => c.id !== otherId);
              next.unshift({
                id: otherId,
                email: existing?.email || otherEmail || 'Unknown',
                lastMessage: message.content,
                sentAt: message.sentAt,
              });
              return next;
            });
          } catch (e) {
            console.error('Invalid STOMP payload', e);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onWebSocketError: (err) => console.error('WebSocket error', err),
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [currentUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    if (!selectedContactId) {
      toast.warning('Select a contact first.');
      return;
    }

    try {
      const sent = await sendChatMessage(selectedContactId, draft.trim(), null);
      setConversation((prev) => [...prev, sent]);
      setDraft('');
      setContacts((prev) => {
        const existing = prev.find((c) => c.id === selectedContactId);
        const next = prev.filter((c) => c.id !== selectedContactId);
        next.unshift({
          id: selectedContactId,
          email: existing?.email || 'Unknown',
          lastMessage: sent.content,
          sentAt: sent.sentAt,
        });
        return next;
      });
    } catch {
      toast.error('Could not send message.');
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
                <div className='font-medium'>{c.email}</div>
                <div className='text-xs text-gray-500'>{c.lastMessage}</div>
              </button>
            ))}
          </div>
          <div className='col-span-8 bg-white rounded shadow p-3 h-[600px] flex flex-col'>
            <div className='mb-2'>
              <h2 className='font-semibold text-lg'>Conversation</h2>
              {selectedContactId ? <p className='text-sm text-gray-500'>Chat with {contacts.find((c) => c.id === selectedContactId)?.email || selectedContactId}</p> : <p className='text-sm text-gray-500'>Select a contact to chat.</p>}
            </div>
            <div className='flex-1 border rounded p-2 overflow-auto bg-slate-50'>
              {conversation.length === 0 ? (
                <div className='text-gray-500 p-4'>No messages yet.</div>
              ) : (
                conversation.map((m) => {
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
