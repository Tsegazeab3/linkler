import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage, getConversations, markChatAsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useChatWebSocket from '../hooks/useChatWebSocket';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef();
  
  const { isConnected, sendEvent, lastEvent } = useChatWebSocket(conversationId);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'chat_message') {
      const message = lastEvent.message;
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      // Send read receipt if this page is active and message is from others
      if (message.sender_username !== user?.username) {
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
  }, [lastEvent, user?.username, sendEvent]);

  const fetchData = async () => {
    try {
      const convs = await getConversations();
      const currentChat = convs.data.find(c => c.id === parseInt(conversationId));
      if (currentChat) {
        setChat(currentChat);
        if (currentChat.unread_count > 0) {
          markChatAsRead(conversationId);
        }
      }

      const msgRes = await getMessages(conversationId);
      setMessages(msgRes.data);
      
      // Also notify server that we've read everything
      const unreadFromOthers = msgRes.data.filter(m => !m.is_read && m.sender_username !== user?.username);
      unreadFromOthers.forEach(m => sendEvent('mark_read', { message_id: m.id }));

    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [conversationId]);

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
    if (newMessage.trim() === '') return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    sendEvent('typing', { is_typing: false });

    if (editingMessage) {
      sendEvent('edit_message', { message_id: editingMessage.id, message: newMessage });
      setEditingMessage(null);
      setNewMessage('');
      return;
    }

    // Use WebSocket for real-time sending
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

  if (loading) return <div className="h-screen flex items-center justify-center text-ui-muted bg-ui-white">Loading chat...</div>;

  if (!chat) {
    return (
      <div className="p-8 text-center h-screen flex flex-col items-center justify-center bg-ui-white">
        <div className="w-16 h-16 bg-error-light text-error rounded-full flex items-center justify-center mb-4 text-2xl font-bold">✕</div>
        <h1 className="text-2xl font-bold text-ui-text-main">Chat not found</h1>
        <p className="text-ui-muted mb-6">This conversation doesn&apos;t exist or you don&apos;t have access.</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-brand text-white rounded-lg font-bold shadow-md active:scale-95 transition-transform">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-ui-bg relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center p-4 bg-ui-white border-b border-ui-border flex-shrink-0 shadow-sm z-10">
        <button onClick={() => navigate(-1)} className="mr-4 lg:hidden text-ui-muted hover:text-ui-text-main">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </button>
        <Avatar className="w-10 h-10 border border-brand-light mr-4">
          <AvatarImage src={chat.avatar} alt={chat.name} className="object-cover" />
          <AvatarFallback className="bg-brand-light text-brand font-bold">{(chat.name || 'Chat').charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <h2 className="text-sm font-bold text-ui-text-main truncate">{chat.name}</h2>
          <p className="text-[10px] text-success font-medium tracking-wide uppercase">Active now</p>
        </div>
      </header>

      {/* Message History */}
      <main ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar pb-20">
        {messages.map((msg, index) => {
          const isMe = user && msg.sender_username === user.username;
          return (
            <div key={index} className={`flex flex-col ${!isMe ? 'items-start' : 'items-end'}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] lg:max-w-lg shadow-sm relative group ${isMe ? 'bg-brand text-white rounded-br-none' : 'bg-ui-white text-ui-text-main rounded-bl-none'}`}>
                
                {/* Reply Preview */}
                {msg.parent_message_details && (
                  <div className={`mb-2 p-2 rounded text-[11px] border-l-4 ${isMe ? 'bg-white/10 border-white/40' : 'bg-ui-bg/50 border-brand/50'}`}>
                    <p className="font-bold opacity-70">{msg.parent_message_details.sender_username}</p>
                    <p className="truncate opacity-90">{msg.parent_message_details.text}</p>
                  </div>
                )}

                {chat.type === 'group' && !isMe && (
                  <p className="text-[10px] font-bold text-brand mb-1">{msg.sender_username}</p>
                )}
                {msg.attachment && (
                  <div className="mb-2">
                    <img src={msg.attachment} alt="attachment" className="rounded-md max-w-full h-auto max-h-48 object-cover" />
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                <div className="flex items-center justify-end gap-1 mt-1 opacity-70">
                  {msg.is_edited && <span className="text-[8px] italic mr-1">edited</span>}
                  <p className="text-[9px] font-medium">
                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </p>
                  {isMe && (
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

                {/* Desktop Hover Actions */}
                <div className={`absolute top-0 ${isMe ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity hidden lg:flex flex-col gap-1`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-ui-white/80 shadow-sm" onClick={() => startReply(msg)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    </Button>
                    {isMe && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-ui-white/80 shadow-sm" onClick={() => startEdit(msg)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Button>
                    )}
                </div>
                {/* Mobile Long Press Placeholder / Simple tap could be added but usually a long press or swipe is used */}
              </div>
            </div>
          );
        })}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-ui-white text-ui-text-main p-2 rounded-2xl rounded-bl-none italic text-xs shadow-sm">
              {chat.name} is typing...
            </div>
          </div>
        )}
      </main>

      {/* Input Section */}
      <footer className="p-4 bg-ui-white border-t border-ui-border flex-shrink-0 z-20">
        {(replyingTo || editingMessage) && (
            <div className="max-w-4xl mx-auto mb-2 p-2 bg-ui-bg-alt rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-1 h-8 bg-brand rounded-full flex-shrink-0" />
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-brand">{replyingTo ? `Replying to ${replyingTo.sender_username}` : 'Editing message'}</p>
                        <p className="text-xs text-ui-text-secondary truncate italic">{replyingTo ? replyingTo.text : editingMessage.text}</p>
                    </div>
                </div>
                <button onClick={() => { setReplyingTo(null); setEditingMessage(null); if (editingMessage) setNewMessage(''); }} className="text-ui-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        )}
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-grow p-3 bg-ui-bg-alt border border-ui-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm"
          />
          <button type="submit" className="p-3 bg-brand text-white rounded-2xl hover:bg-brand-hover transition-all shadow-md active:scale-95">
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
