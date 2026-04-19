import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { getMessages, sendMessage, getConversations, markChatAsRead, updateGroupAvatar } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useChatWebSocket from '../hooks/useChatWebSocket';
import { Paperclip, Send, X, Smile, MoreHorizontal, Reply, Edit2, Info, Copy, Users, Camera } from "lucide-react";
import { toast } from 'sonner';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { handleOpenChat } = useOutletContext() || {};
  const [chat, setChat] = useState(location.state?.chat || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef();
  const fileInputRef = useRef(null);
  
  const { isConnected, sendEvent, lastEvent } = useChatWebSocket(conversationId);

  useEffect(() => {
    if (!lastEvent || !user) return;

    if (lastEvent.type === 'chat_message') {
      const message = lastEvent.message;
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
      // Send read receipt if this page is active and message is from others
      if (message.sender_username !== user.username) {
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
  }, [lastEvent, user, sendEvent]);

  // Handle marking existing unread messages as read when connected
  useEffect(() => {
    if (isConnected && messages.length > 0 && user) {
      const unreadFromOthers = messages.filter(m => !m.is_read && m.sender_username !== user.username);
      if (unreadFromOthers.length > 0) {
        unreadFromOthers.forEach(m => sendEvent('mark_read', { message_id: m.id }));
      }
    }
  }, [isConnected, messages.length, user, sendEvent]);

  const fetchData = async () => {
    try {
      const convs = await getConversations();
      // Handle potential pagination (results key) or direct array
      const conversations = Array.isArray(convs.data) ? convs.data : (convs.data.results || []);
      const currentChat = conversations.find(c => c.id === parseInt(conversationId));
      if (currentChat) {
        setChat(currentChat);
        if (currentChat.unread_count > 0) {
          markChatAsRead(conversationId);
        }
      }

      const msgRes = await getMessages(conversationId);
      // Messages might also be paginated
      const messagesData = Array.isArray(msgRes.data) ? msgRes.data : (msgRes.data.results || []);
      setMessages(messagesData);
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
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
        const res = await sendMessage(conversationId, formData);
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

  const copyInviteCode = () => {
    if (!displayChat?.invite_code) return;
    navigator.clipboard.writeText(displayChat.invite_code);
    toast.success("Invite code copied!", {
        description: "Share this code with friends to join the group."
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const res = await updateGroupAvatar(conversationId, formData);
      setChat(res.data);
      toast.success("Group avatar updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update avatar");
    }
  };

  const displayChat = chat || location.state?.chat;

  if (!displayChat && loading) return null;

  return (
    <div className="fixed inset-0 bottom-0 lg:bottom-0 lg:relative lg:inset-auto flex flex-col bg-ui-bg z-[100] lg:z-auto animate-in slide-in-from-right lg:slide-in-from-none duration-300 overflow-hidden shadow-2xl lg:shadow-none h-full">
      {/* Header */}
      <header className="flex items-center p-4 bg-ui-white border-b border-ui-border flex-shrink-0 shadow-sm z-10">
        <button onClick={() => navigate('/app/messages')} className="mr-4 lg:hidden text-ui-muted hover:text-ui-text-main">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </button>
        <div 
          className="flex-grow flex items-center cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          onClick={() => handleOpenChat && handleOpenChat(displayChat, displayChat?.type)}
        >
          <Avatar className="w-10 h-10 border border-brand-light mr-4">
            <AvatarImage src={displayChat?.avatar} alt={displayChat?.name} className="object-cover" />
            <AvatarFallback className="bg-brand-light text-brand font-bold">{(displayChat?.name || 'Chat').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <h2 className="text-sm font-bold text-ui-text-main truncate">{displayChat?.name}</h2>
            <p className="text-[10px] text-success font-medium tracking-wide uppercase">Active now</p>
          </div>
        </div>
        
        {displayChat?.type === 'group' && (
            <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-xl transition-all ${showInfo ? 'bg-brand/10 text-brand' : 'text-ui-muted hover:bg-ui-bg-alt'}`}
            >
                <Info className="h-6 w-6" />
            </button>
        )}
      </header>

      <div className="flex-grow flex overflow-hidden">
          <div className="flex-grow flex flex-col min-w-0">
            {/* Message History */}
            <main ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar pb-20 relative bg-ui-bg">
        {messages.map((msg, index) => {
          const isMe = user && msg.sender_username === user.username;

          return (
            <div key={index} className={`flex flex-col ${!isMe ? 'items-start' : 'items-end'}`}>
              <div className={`p-3 rounded-2xl max-w-[85%] lg:max-w-lg shadow-sm relative group ${isMe ? 'bg-brand text-white rounded-br-none' : 'bg-ui-white text-ui-text-main rounded-bl-none border border-ui-border/50'}`}>
                
                {/* Reply Preview */}
                {msg.parent_message_details && (
                  <div className={`mb-2 p-2 rounded text-[11px] border-l-4 ${isMe ? 'bg-white/10 border-white/40' : 'bg-ui-bg/50 border-brand/50'}`}>
                    <p className="font-bold opacity-70">{msg.parent_message_details.sender_username}</p>
                    <p className="truncate opacity-90">{msg.parent_message_details.text}</p>
                  </div>
                )}

                {displayChat?.type === 'group' && !isMe && (
                  <p className="text-[10px] font-bold text-brand mb-1">{msg.sender_username}</p>
                )}

                {msg.attachment && (
                  <div className="mb-2">
                    {msg.attachment.match(/\.(jpeg|jpg|gif|png|webp)(\?|#|$)/i) != null ? (
                      <img src={msg.attachment} alt="attachment" className="rounded-xl max-w-full h-auto max-h-64 object-cover" />
                    ) : (
                      <a href={msg.attachment} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-3 rounded-xl overflow-hidden ${isMe ? 'bg-white/10' : 'bg-ui-bg-alt'}`}>
                        <Paperclip className="h-5 w-5 flex-shrink-0" />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold truncate">{msg.attachment.split('/').pop()}</p>
                          <p className="text-[10px] opacity-70">Click to view file</p>
                        </div>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-ui-white shadow-md border border-ui-border" onClick={() => startReply(msg)}>
                        <Reply className="h-4 w-4" />
                    </Button>
                    {isMe && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-ui-white shadow-md border border-ui-border" onClick={() => startEdit(msg)}>
                            <Edit2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </div>
            </div>
          );
        })}
        {otherUserTyping && (
          <div className="flex justify-start animate-in slide-in-from-bottom-2">
            <div className="bg-ui-white text-ui-text-main px-4 py-2 rounded-2xl rounded-bl-none italic text-xs shadow-sm border border-ui-border/50">
              {displayChat?.name} is typing...
            </div>
          </div>
        )}
      </main>

      {/* Input Section */}
      <footer className="p-4 bg-ui-white border-t border-ui-border flex-shrink-0 z-20">
        <div className="max-w-4xl mx-auto space-y-3">
            {/* Attachment Preview */}
            {attachment && (
              <div className="flex items-center justify-between bg-brand/5 text-brand p-3 rounded-xl text-xs border border-brand/20 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Paperclip className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold truncate">{attachment.name}</p>
                    <p className="text-[10px] opacity-70">{(attachment.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="w-8 h-8 rounded-full hover:bg-brand/10 flex items-center justify-center transition-colors">
                   <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Reply/Edit Bar */}
            {(replyingTo || editingMessage) && (
                <div className="p-3 bg-ui-bg-alt/50 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 border border-ui-border/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-1 h-8 bg-brand rounded-full flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-brand uppercase tracking-widest">{replyingTo ? `Replying to ${replyingTo.sender_username}` : 'Editing message'}</p>
                            <p className="text-xs text-ui-text-secondary truncate italic">{replyingTo ? replyingTo.text : editingMessage.text}</p>
                        </div>
                    </div>
                    <button onClick={() => { setReplyingTo(null); setEditingMessage(null); if (editingMessage) setNewMessage(''); }} className="w-8 h-8 rounded-full hover:bg-ui-bg-alt flex items-center justify-center">
                        <X className="h-4 w-4 text-ui-muted" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-ui-muted hover:text-brand hover:bg-brand/5 rounded-2xl transition-all"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <div className="relative flex-grow">
                <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="w-full p-3.5 pr-12 bg-ui-bg-alt border border-ui-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm transition-all"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-muted hover:text-brand transition-colors">
                    <Smile className="h-5 w-5" />
                </button>
              </div>

              <button 
                type="submit" 
                disabled={!newMessage.trim() && !attachment}
                className={`p-3.5 rounded-2xl transition-all shadow-md active:scale-95 ${(!newMessage.trim() && !attachment) ? 'bg-ui-bg-alt text-ui-muted cursor-not-allowed' : 'bg-brand text-white hover:bg-brand-hover'}`}
              >
                 <Send className="h-5 w-5" />
              </button>
            </form>
        </div>
      </footer>
    </div>

    {/* Group Info Sidebar */}
    {displayChat?.type === 'group' && showInfo && (
        <aside className="w-full lg:w-72 bg-ui-white border-l border-ui-border flex flex-col animate-in slide-in-from-right-4 duration-300 absolute inset-0 z-[30] lg:relative lg:inset-auto shadow-2xl lg:shadow-none">
          <div className="p-4 border-b border-ui-border flex items-center justify-between">
              <h3 className="font-black uppercase tracking-widest text-[10px] text-ui-muted">Group Info</h3>
              <button onClick={() => setShowInfo(false)} className="lg:hidden p-2 rounded-full hover:bg-ui-bg-alt">
                  <X className="h-5 w-5 text-ui-muted" />
              </button>
          </div>
          
                <div className="flex-grow overflow-y-auto p-6 no-scrollbar">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="relative group/avatar">
                            <Avatar className="w-24 h-24 border-4 border-ui-white shadow-xl mb-4">
                                <AvatarImage src={displayChat.avatar} className="object-cover" />
                                <AvatarFallback className="text-2xl font-bold bg-brand-light text-brand">
                                    {displayChat.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute inset-0 mb-4 rounded-full bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera className="text-white h-8 w-8" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <h4 className="font-bold text-lg text-ui-text-main">{displayChat.name}</h4>
                        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-ui-bg-alt border border-ui-border">
                            <Users className="h-3 w-3 text-ui-muted" />
                            <span className="text-[10px] font-bold text-ui-text-secondary uppercase tracking-widest">{displayChat.members_details?.length || 0} members</span>
                        </div>
                    </div>

              <div className="space-y-6">
                  {displayChat.invite_code && (
                      <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand mb-3">Invite Link</p>
                          <div className="flex items-center gap-2">
                              <div className="flex-grow font-mono text-sm font-bold bg-ui-white border border-ui-border px-3 py-2 rounded-xl text-center tracking-widest">
                                  {displayChat.invite_code}
                              </div>
                              <button 
                                  onClick={copyInviteCode}
                                  className="p-2 bg-brand text-white rounded-xl hover:bg-brand-hover active:scale-95 transition-all shadow-md"
                              >
                                  <Copy className="h-4 w-4" />
                              </button>
                          </div>
                          <p className="text-[9px] text-ui-muted mt-3 leading-relaxed">Share this code with other travelers to join this conversation instantly.</p>
                      </div>
                  )}

                  <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted mb-4">Members</p>
                      <div className="space-y-3">
                          {displayChat.members_details?.map(member => (
                              <div key={member.id} className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border border-ui-border">
                                      <AvatarImage src={member.profile_picture} className="object-cover" />
                                      <AvatarFallback className="text-[10px]">{member.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="overflow-hidden">
                                      <p className="text-xs font-bold text-ui-text-main truncate">{member.username}</p>
                                      <p className="text-[9px] text-ui-muted truncate">{member.account_type || 'Traveler'}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        </aside>
    )}
</div>
</div>
  );
};

export default ChatPage;
