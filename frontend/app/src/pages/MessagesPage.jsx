import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { getConversations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import SvgChats from '../components/icons/Chats.jsx';
import SvgGroups from '../components/icons/Groups.jsx';

const ChatPreview = ({ onSelect, conversation }) => {
  const lastMsg = conversation.last_message;
  return (
    <button onClick={onSelect} className="w-full text-left p-4 rounded-2xl hover:bg-ui-bg-alt/80 transition-all duration-200 flex items-center space-x-4 group border border-transparent hover:border-ui-border bg-ui-white shadow-sm mb-2">
      <Avatar className="w-14 h-14 border border-brand/20 shadow-sm group-hover:shadow transition-shadow bg-gradient-to-br from-brand-light to-accent-indigo/10 text-brand font-bold shrink-0">
        <AvatarImage src={conversation.avatar} alt={conversation.name} className="object-cover" />
        <AvatarFallback>{(conversation.name || 'Chat').charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <h4 className={`font-bold text-sm truncate ${conversation.unread_count > 0 ? 'text-ui-text-main' : 'text-ui-text-secondary'}`}>
            {conversation.name || 'Personal Chat'}
          </h4>
          <span className="text-[10px] text-ui-muted flex-shrink-0 font-medium whitespace-nowrap ml-2">
            {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-ui-text-main font-semibold' : 'text-ui-text-secondary'}`}>
          {lastMsg ? lastMsg.text : 'No messages yet'}
        </p>
      </div>
      {conversation.unread_count > 0 && <div className="w-3 h-3 bg-brand rounded-full flex-shrink-0 self-center ml-2 ring-4 ring-brand/10 animate-pulse"></div>}
    </button>
  );
};

const MessagesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'groups'

  useEffect(() => {
    if (isAuthenticated) {
      getConversations()
        .then(res => setConversations(res.data))
        .catch(err => console.error('Chat error:', err))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery;
    if (activeTab === 'groups') return c.type === 'group' && matchesSearch;
    return matchesSearch;
  });

  return (
    <div className="flex h-screen h-[100dvh] lg:h-[calc(100vh-0rem)] bg-ui-bg relative overflow-hidden">
      {/* Column: Messages List (Mobile Only - Desktop uses SideNav Panel) */}
      <div className={`flex-col w-full lg:hidden border-r border-ui-border bg-ui-white z-10 ${location.pathname !== '/app/messages' ? 'hidden' : 'flex'}`}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-ui-white/90 backdrop-blur-md border-b border-ui-border px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-ui-text-main tracking-tight italic">Messages</h1>
                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full bg-ui-bg-alt flex items-center justify-center text-ui-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-ui-muted" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                type="text"
                className="pl-9 bg-ui-bg-alt border-none rounded-2xl h-11"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeTab === 'all' ? 'bg-brand text-white shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary hover:bg-ui-border/50'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setActiveTab('groups')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeTab === 'groups' ? 'bg-brand text-white shadow-md' : 'bg-ui-bg-alt text-ui-text-secondary hover:bg-ui-border/50'}`}
                >
                    Groups
                </button>
            </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 no-scrollbar">
            {loading ? (
            <div className="space-y-4">
                {[1,2,3,4,5,6].map(i => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-ui-white rounded-2xl animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-ui-bg-alt"></div>
                    <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-ui-bg-alt rounded w-3/4"></div>
                    <div className="h-2 bg-ui-bg rounded w-1/2"></div>
                    </div>
                </div>
                ))}
            </div>
            ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
                <ChatPreview 
                key={conv.id} 
                conversation={conv} 
                onSelect={() => navigate(`/app/messages/${conv.id}`, { state: { chat: conv } })} 
                />
            ))
            ) : (
            <div className="text-center py-20 px-6">
                <div className="w-16 h-16 bg-brand-light text-brand/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <SvgChats className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-ui-text-main mb-2">No conversations</h3>
            </div>
            )}
        </div>
      </div>

      {/* Right Column / Full Screen Chat: Specific Chat Outlet */}
      <div className={`flex-grow relative h-full bg-ui-bg-alt/20 ${location.pathname === '/app/messages' ? 'hidden lg:block' : 'block'}`}>
        {location.pathname === '/app/messages' ? (
            <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-ui-bg-alt rounded-full flex items-center justify-center mb-6">
                    <SvgChats className="w-12 h-12 text-ui-muted" />
                </div>
                <h2 className="text-2xl font-bold text-ui-text-main mb-2">Your Messages</h2>
                <p className="text-ui-muted max-w-sm">Select a conversation from the left to start chatting with travelers and guides.</p>
            </div>
        ) : (
            <Outlet />
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
