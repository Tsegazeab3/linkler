import React, { useState, useEffect, useRef } from 'react';
import { getMessages, sendMessage, markChatAsRead } from '../services/api';

const ChatWindow = ({ chat, type, onClose, index }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef();
  
  const rightPosition = 20 + (index * 340);
  
  const fetchMessages = () => {
    getMessages(chat.id)
      .then(res => {
        setMessages(res.data);
        if (res.data.some(m => !m.is_read && m.sender !== chat.current_user_id)) {
           markChatAsRead(chat.id);
        }
      })
      .catch(err => console.error('Error fetching messages:', err));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    try {
      const res = await sendMessage(chat.id, newMessage);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const content = (
    <>
      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 p-4 no-scrollbar">
        {messages.map((msg, idx) => {
          const isMe = msg.sender === chat.current_user_id;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[80%] ${isMe ? 'bg-[#3b82f6] text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                {type === 'group' && !isMe && (
                  <p className="text-[10px] font-bold opacity-70 mb-1">{msg.sender_username}</p>
                )}
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="p-3 flex-shrink-0 flex items-center border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 bg-white border border-gray-200 rounded-full text-sm px-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button type="submit" className="ml-2 p-2 bg-[#3b82f6] text-white rounded-full hover:bg-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </>
  );

  return (
    <div 
      className="fixed bottom-0 bg-white w-80 h-[400px] rounded-t-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
      style={{ right: `${rightPosition}px`, transform: isMinimized ? 'translateY(350px)' : 'translateY(0)' }}
    >
      <div 
        className="flex items-center p-2 border-b border-gray-200 cursor-pointer flex-shrink-0"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <img src={chat.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'} alt={chat.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
        <h3 className="text-md font-bold text-gray-800 truncate">{chat.name}</h3>
        <div className="flex-grow" />
        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-gray-500 hover:text-gray-800 p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onClose(chat.id, type); }} className="text-gray-500 hover:text-gray-800 p-1 ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {!isMinimized && content}
    </div>
  );
};

export default ChatWindow;
