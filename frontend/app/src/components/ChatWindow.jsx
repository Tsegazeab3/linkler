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
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef();
  const fileInputRef = useRef(null);
  
  const rightPosition = 20 + (index * 340);
  
  const { isConnected, sendEvent, lastEvent } = useChatWebSocket(chat.id);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'chat_message') {
      const message = lastEvent.message;
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      if (!isMinimized && message.sender_username === chat.name) {
        sendEvent('mark_read', { message_id: message.id });
      }
    } else if (lastEvent.type === 'typing') {
      setOtherUserTyping(lastEvent.is_typing);
    } else if (lastEvent.type === 'read_receipt') {
      setMessages((prev) => prev.map(m => 
        m.id === lastEvent.message_id ? { ...m, is_read: true } : m
      ));
    } else if (lastEvent.type === 'message_edited') {
      setMessages((prev) => prev.map(m => 
        m.id === lastEvent.message.id ? { ...m, text: lastEvent.message.text, is_edited: true } : m
      ));
    }
  }, [lastEvent, isMinimized, chat.name, sendEvent]);

  const fetchMessages = () => {
    getMessages(chat.id)
      .then(res => {
        setMessages(res.data);
        const unreadMessages = res.data.filter(m => !m.is_read && m.sender_username === chat.name);
        if (unreadMessages.length > 0) {
           markChatAsRead(chat.id);
           unreadMessages.forEach(m => sendEvent('mark_read', { message_id: m.id }));
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
  }, [messages, otherUserTyping]);

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendEvent('typing', { is_typing: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendEvent('typing', { is_typing: false });
    }, 2000);
  };
  
  const handleSend = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' && !attachment) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    sendEvent('typing', { is_typing: false });

    if (editingMessage) {
      sendEvent('edit_message', { message_id: editingMessage.id, message: newMessage });
      setEditingMessage(null);
      setNewMessage('');
      return;
    }

    if (attachment) {
      try {
        const formData = new FormData();
        formData.append('text', newMessage);
        formData.append('attachment', attachment);
        if (replyingTo) formData.append('parent_message', replyingTo.id);
        const res = await sendMessage(chat.id, formData);
        setMessages([...messages, res.data]);
        setNewMessage('');
        setAttachment(null);
        setReplyingTo(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        console.error('Send error:', err);
      }
      return;
    }

    // Use WebSocket for text messages
    sendEvent('chat_message', { 
        message: newMessage,
        parent_message_id: replyingTo ? replyingTo.id : null
    });
    setNewMessage('');
    setReplyingTo(null);
  };

  const startEdit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.text);
    setReplyingTo(null);
  };

  const startReply = (msg) => {
    setReplyingTo(msg);
    setEditingMessage(null);
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
          <div key={idx} className={`flex flex-col ${msg.sender_username === chat.name ? 'items-start' : 'items-end'}`}>
            <div className={`p-3 rounded-lg max-w-[85%] relative group ${msg.sender_username !== chat.name ? 'bg-brand text-white rounded-br-none' : 'bg-ui-bg-alt text-ui-text-main rounded-bl-none'}`}>
              
              {/* Parent Message Preview for Replies */}
              {msg.parent_message_details && (
                <div className={`mb-2 p-2 rounded text-xs border-l-4 ${msg.sender_username !== chat.name ? 'bg-white/10 border-white/40' : 'bg-ui-bg/50 border-brand/50'}`}>
                  <p className="font-bold opacity-70">{msg.parent_message_details.sender_username}</p>
                  <p className="truncate opacity-90">{msg.parent_message_details.text}</p>
                </div>
              )}

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

              {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
              
              <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                {msg.is_edited && <span className="text-[8px] italic mr-1">edited</span>}
                <p className="text-[9px] font-medium">
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
                {msg.sender_username !== chat.name && (
                  <div className="flex items-center ml-0.5">
                    {msg.is_read ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10.707 5.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L4 8.586l3.293-3.293a1 1 0 011.414 0z" clipRule="evenodd" transform="translate(4,0)" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>

              {/* Hover Actions: Reply and Edit */}
              <div className={`absolute top-0 ${msg.sender_username !== chat.name ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1`}>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-ui-bg-alt/80 hover:bg-ui-bg-alt shadow-sm"
                    onClick={() => startReply(msg)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                </Button>
                {msg.sender_username !== chat.name && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full bg-ui-bg-alt/80 hover:bg-ui-bg-alt shadow-sm"
                        onClick={() => startEdit(msg)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-ui-bg-alt text-ui-text-main p-2 rounded-lg rounded-bl-none italic text-xs">
              {chat.name} is typing...
            </div>
          </div>
        )}
      </div>

      {/* Reply/Edit Context Bar */}
      {(replyingTo || editingMessage) && (
        <div className="px-3 py-2 border-t border-ui-border bg-ui-bg/50 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-1 h-8 bg-brand rounded-full flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-brand">
                {replyingTo ? `Replying to ${replyingTo.sender_username}` : 'Editing message'}
              </p>
              <p className="text-xs text-ui-text-secondary truncate italic">
                {replyingTo ? replyingTo.text : editingMessage.text}
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setReplyingTo(null); setEditingMessage(null); if (editingMessage) setNewMessage(''); }}
            className="text-ui-muted hover:text-ui-text-main"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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
            onChange={handleTyping}
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
