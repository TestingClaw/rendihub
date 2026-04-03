import { useEffect, useState } from 'react';
import http from '../api/http';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const selectConversation = async (conversation) => {
    setActive(conversation);
    const { data } = await http.get(`/messages/conversations/${conversation.id}`);
    setMessages(data.messages);
  };

  const loadConversations = async () => {
    const { data } = await http.get('/messages/conversations');
    setConversations(data.conversations);
    if (!active && data.conversations[0]) {
      await selectConversation(data.conversations[0]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const sendReply = async () => {
    if (!active || !text.trim()) return;
    const renterId = active.owner_id === user.id ? active.renter_id : undefined;
    await http.post('/messages', { listingId: active.listing_id, renterId, body: text });
    setText('');
    await selectConversation(active);
    await loadConversations();
  };

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
        <h1 className="mb-4 px-2 text-2xl font-semibold text-white">Messages</h1>
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button key={conversation.id} onClick={() => selectConversation(conversation)} className={`w-full rounded-2xl p-4 text-left transition ${active?.id === conversation.id ? 'bg-cyan-500/20' : 'bg-slate-950/80 hover:bg-slate-900'}`}>
              <p className="font-semibold text-white">{conversation.title}</p>
              <p className="mt-1 text-sm text-slate-400">{conversation.last_message || 'No messages yet'}</p>
            </button>
          ))}
          {!conversations.length && <p className="px-2 text-sm text-slate-400">No conversations yet.</p>}
        </div>
      </section>

      <section className="flex flex-col rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        {active ? (
          <>
            <div className="mb-4 border-b border-white/10 pb-4">
              <h2 className="text-xl font-semibold text-white">{active.title}</h2>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto">
              {messages.map((message) => (
                <div key={message.id} className={`max-w-xl rounded-2xl px-4 py-3 ${message.sender_id === user.id ? 'ml-auto bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950' : 'bg-slate-950 text-slate-200'}`}>
                  {message.body}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" />
              <button onClick={sendReply} className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 font-semibold text-slate-950">Send</button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400">Choose a conversation</div>
        )}
      </section>
    </div>
  );
}
