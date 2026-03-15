import React, { useEffect, useState } from 'react';
import { getMyMessages, getConversation, sendChatMessage } from '../api/recruiterApi';
import Navbar from './Navbar';
import { toast } from 'react-toastify';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [draft, setDraft] = useState('');

  const loadMessages = async () => {
    try {
      const data = await getMyMessages();
      setMessages(data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const getContacts = (msgs) => {
    const map = new Map();
    msgs.forEach((msg) => {
      if (msg.senderId && msg.senderEmail) {
        map.set(msg.senderId, msg.senderEmail);
      }
      if (msg.recipientId && msg.recipientEmail) {
        map.set(msg.recipientId, msg.recipientEmail);
      }
    });
    return Array.from(map.entries()).map(([id, email]) => ({ id, email }));
  };

  const openConversation = async (selectedContact) => {
    try {
      setContact(selectedContact);
      const data = await getConversation(selectedContact.id);
      setConversation(data);
    } catch (error) {
      toast.error('Failed to open conversation');
    }
  };

  const handleSend = async () => {
    if (!contact?.id) return toast.error('Select a contact first');
    if (!draft.trim()) return toast.error('Write a message first');
    try {
      await sendChatMessage(contact.id, draft, null);
      setDraft('');
      openConversation(contact);
      loadMessages();
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send');
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const contacts = getContacts(messages);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-3">Contacts</h2>
          {contacts.length === 0 && <p className="text-gray-500">No messages yet.</p>}
          <div className="space-y-2">
            {contacts.map((c) => (
              <button key={c.id} onClick={() => openConversation(c)} className={`w-full text-left p-2 rounded ${contact?.id === c.id ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                {c.email}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Conversation</h2>
            {contact && <span className="text-sm text-gray-500">With {contact.email}</span>}
          </div>
          <div className="h-96 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 mb-3">
            {conversation.length === 0 && <div className="text-gray-500">Select a contact to view messages.</div>}
            {conversation.map((m) => (
              <div key={m.id} className={`p-2 mb-1 rounded ${m.senderId === contact?.id ? 'bg-white text-left' : 'bg-blue-100 text-right'}`}>
                <div className="text-xs text-gray-500">{m.senderEmail}</div>
                <div className="text-sm">{m.content}</div>
                <div className="text-xs text-gray-400">{new Date(m.sentAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your message..." className="w-full rounded border p-2" />
            <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
