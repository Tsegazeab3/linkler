import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage, getConversations, markChatAsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef();
  
  const fetchData = async () => {
    try {
      // Find current conversation
      const convs = await getConversations();
      const currentChat = convs.data.find(c => c.id === parseInt(conversationId));
      if (currentChat) {
        setChat(currentChat);
        // Mark as read
        if (currentChat.unread_count > 0) {
          markChatAsRead(conversationId);
        }
      }

      const msgRes = await getMessages(conversationId);
      setMessages(msgRes.data);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000); // Polling every 4s
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    try {
      const res = await sendMessage(conversationId, newMessage);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500 bg-white">Loading chat...</div>;

  if (!chat) {
    return (
      <div className="p-8 text-center h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
           ✕
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Chat not found</h1>
        <p className="text-gray-500 mb-6">This conversation doesn&apos;t exist or you don&apos;t have access.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#3b82f6] text-white rounded-lg font-bold shadow-md active:scale-95 transition-transform">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-gray-50">
      {/* Header */}
      <header className="flex items-center p-4 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="mr-4 lg:hidden text-gray-400 hover:text-gray-700">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </button>
        <Avatar className="w-10 h-10 border border-blue-100 mr-4">
          <AvatarImage src={chat.avatar} alt={chat.name} className="object-cover" />
          <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
            {(chat.name || 'Chat').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h2 className="text-sm font-bold text-gray-800 truncate">{chat.name}</h2>
          <p className="text-[10px] text-green-500 font-medium tracking-wide uppercase">Active now</p>
        </div>
      </header>

      {/* Message History */}
      <main ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, index) => {
          const isMe = user && msg.sender === user.id;
          return (
            <div key={index} className={`flex items-end gap-2 ${!isMe ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] lg:max-w-lg shadow-sm ${isMe ? 'bg-[#3b82f6] text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                {chat.type === 'group' && !isMe && (
                  <p className="text-[10px] font-bold text-blue-600 mb-1">{msg.sender_username}</p>
                )}
                {msg.attachment && (
                  <div className="mb-2">
                    <img src={msg.attachment} alt="attachment" className="rounded-md max-w-full h-auto max-h-48 object-cover" />
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.text}</p>
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
            className="flex-grow p-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          />
          <button type="submit" className="p-3 bg-[#3b82f6] text-white rounded-2xl hover:bg-blue-600 transition-all shadow-md active:scale-95">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
             </svg>
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatPage;