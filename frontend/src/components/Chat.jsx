import React, { useEffect, useState } from 'react';
import { getMyMessages, getConversation, sendChatMessage } from '../api/recruiterApi';
import Navbar from './Navbar';
import { toast } from 'react-toastify';

const groupByContact = (messages) => {
  const contacts = {};
  messages.forEach((msg) => {
    [msg.senderEmail, msg.recipientEmail].forEach((email) => {
      contacts[email] = true;
    });
  });
  return Object.keys(contacts).filter((email) => email);
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState('');
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

  const openConversation = async (contactEmail) => {
    try {
      setContact(contactEmail);
      const data = await getConversation(contactEmail);
      setConversation(data);
    } catch (error) {
      toast.error('Failed to open conversation');
    }
  };

  const handleSend = async () => {
    if (!contact) return toast.error('Select a contact first');
    if (!draft.trim()) return toast.error('Write a message first');
    try {
      await sendChatMessage(contact, draft, null);
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

  const contactGroups = groupByContact(messages);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-3">Contacts</h2>
          {contactGroups.length === 0 && <p className="text-gray-500">No messages yet.</p>}
          <div className="space-y-2">
            {contactGroups.map((c) => (
              <button key={c} onClick={() => openConversation(c)} className={`w-full text-left p-2 rounded ${contact === c ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow lg:col-span-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold">Conversation</h2>
            {contact && <span className="text-sm text-gray-500">With {contact}</span>}
          </div>
          <div className="h-96 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50 mb-3">
            {conversation.length === 0 && <div className="text-gray-500">Select a contact to view messages.</div>}
            {conversation.map((m) => (
              <div key={m.id} className={`p-2 mb-1 rounded ${m.senderEmail === contact ? 'bg-white text-left' : 'bg-blue-100 text-right'}`}>
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
