import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessages, sendMessage, getConversations } from '../services/api';

const GroupChatPage = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();
  
  const fetchData = async () => {
    try {
      // Find current group in conversations
      const convs = await getConversations();
      const currentGroup = convs.data.find(c => c.id === parseInt(groupId));
      if (currentGroup) setGroup(currentGroup);

      const msgRes = await getMessages(groupId);
      setMessages(msgRes.data);
    } catch (err) {
      console.error('Group chat error:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    try {
      const res = await sendMessage(groupId, newMessage);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading group chat...</div>;

  if (!group) {
    return (
      <div className="p-8 text-center h-screen flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
           ✕
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Group not found</h1>
        <p className="text-gray-500 mb-6">Either you aren&apos;t a member or the group doesn&apos;t exist.</p>
        <Link to="/app" className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg font-bold">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center p-4 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
        <Link to="/app" className="mr-4 lg:hidden text-gray-500">
           ←
        </Link>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-4">
          {group.avatar ? <img src={group.avatar} className="w-full h-full object-cover rounded-full" /> : group.name?.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{group.name}</h2>
          <p className="text-xs text-green-500 font-medium">Active now</p>
        </div>
      </header>

      {/* Message History */}
      <main ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = msg.sender === group.current_user_id;
          return (
            <div key={index} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl max-w-lg shadow-sm ${isMe ? 'bg-[#3b82f6] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                {!isMe && <p className="text-[10px] font-bold text-blue-600 mb-1">{msg.sender_username}</p>}
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                   {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </main>

      {/* Message Input */}
      <footer className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-3 bg-gray-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button type="submit" className="p-3 bg-[#3b82f6] text-white rounded-2xl hover:bg-blue-600 transition-all shadow-md active:scale-95">
             Send
          </button>
        </form>
      </footer>
    </div>
  );
};

export default GroupChatPage;