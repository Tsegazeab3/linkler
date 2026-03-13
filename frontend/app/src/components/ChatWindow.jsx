import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getMessages, sendMessage, markChatAsRead } from '../services/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useChatWebSocket from '../hooks/useChatWebSocket';

const ChatWindow = ({ chat, type, onClose, index }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef();
  const fileInputRef = useRef(null);
  
  const rightPosition = 20 + (index * 340);
  
  const handleIncomingMessage = useCallback((message) => {
    setMessages((prev) => {
      // Avoid duplicate messages if the message was already added by handleSend
      const exists = prev.some(m => m.id === message.id);
      if (exists) return prev;
      return [...prev, message];
    });
  }, []);

  const { isConnected, sendMessage: sendWSMessage } = useChatWebSocket(chat.id, handleIncomingMessage);

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
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' && !attachment) return;
    
    // Fallback to REST only for attachments (if not handled by WS)
    if (attachment) {
      try {
        const formData = new FormData();
        formData.append('text', newMessage);
        formData.append('attachment', attachment);
        const res = await sendMessage(chat.id, formData);
        setMessages([...messages, res.data]);
        setNewMessage('');
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error('Send error:', err);
      }
      return;
    }

    // Use WebSocket for text messages
    sendWSMessage(newMessage);
    setNewMessage('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const content = (
    <>
      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 p-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender_username === chat.name ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-3 rounded-lg max-w-[80%] ${msg.sender_username !== chat.name ? 'bg-brand text-white rounded-br-none' : 'bg-ui-bg-alt text-ui-text-main rounded-bl-none'}`}>
              {type === 'group' && msg.sender_username !== chat.name && (
                <p className="text-[10px] font-bold opacity-70 mb-1">{msg.sender_username}</p>
              )}
              {msg.attachment && (
                <div className="mb-2">
                  {msg.attachment.match(/\.(jpeg|jpg|gif|png|webp)(\?|#|$)/i) != null ? (
                    <img src={msg.attachment} alt="attachment" className="rounded-md max-w-full h-auto max-h-48 object-cover" />
                  ) : (
                    <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-ui-text-main/10 rounded overflow-hidden">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-xs truncate block max-w-[150px]">{msg.attachment.split('/').pop()}</span>
                    </a>
                  )}
                </div>
              )}
              {msg.text && <p className="text-sm">{msg.text}</p>}
              <p className={`text-[9px] mt-1 text-right ${msg.sender_username !== chat.name ? 'text-brand-light/80' : 'text-ui-muted'}`}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-3 flex-shrink-0 flex flex-col border-t border-ui-border/50 bg-ui-bg-alt/30 rounded-b-lg gap-2">
        {attachment && (
          <div className="flex items-center justify-between bg-brand-light text-brand p-2 rounded-md text-xs border border-brand/20">
            <div className="flex items-center gap-2 truncate">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate">{attachment.name}</span>
            </div>
            <button type="button" onClick={() => { setAttachment(null); fileInputRef.current.value = ''; }} className="text-brand/60 hover:text-brand ml-2">
               &times;
            </button>
          </div>
        )}
        <div className="flex items-center w-full gap-2 px-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <Button 
            type="button" 
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()} 
            className="rounded-full flex-shrink-0 bg-background"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-45 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </Button>
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow rounded-full bg-background"
          />
          <Button type="submit" size="icon" className="rounded-full flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
      </form>
    </>
  );

  return (
    <div 
      className="fixed bottom-0 bg-ui-white w-80 h-[400px] rounded-t-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
      style={{ right: `${rightPosition}px`, transform: isMinimized ? 'translateY(350px)' : 'translateY(0)' }}
    >
      <div 
        className="flex items-center p-2 border-b border-ui-border cursor-pointer flex-shrink-0 hover:bg-ui-bg transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <Avatar className="w-8 h-8 mr-3 border border-ui-border">
          <AvatarImage src={chat.avatarUrl} alt={chat.name} className="object-cover" />
          <AvatarFallback>{chat.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h3 className="text-sm font-bold truncate">{chat.name}</h3>
        <div className="flex-grow" />
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="h-7 w-7 rounded-full text-ui-muted hover:text-ui-text-main">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </Button>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onClose(chat.id, type); }} className="h-7 w-7 rounded-full ml-1 text-ui-muted hover:text-ui-text-main">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
      
      {!isMinimized && content}
    </div>
  );
};

export default ChatWindow;
