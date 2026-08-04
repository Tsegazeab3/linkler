import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Input } from "@/components/ui/input";
import SvgChats from '../components/icons/Chats.jsx';
import ChatPreview from '../components/ChatPreview';

const MessagesPage = () => {
  const { conversations, loadingConversations } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'groups'

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery;
    if (activeTab === 'groups') return c.type === 'group' && matchesSearch;
    return matchesSearch;
  }) : [];

  return (
    <div className="flex h-screen h-[100dvh] lg:h-[calc(100vh-0rem)] bg-ui-bg relative overflow-hidden">
      {/* Column: Messages List (Mobile Only - Desktop uses SideNav Panel) */}
      <div className={`flex-col w-full lg:hidden border-r border-ui-border bg-ui-white z-10 ${location.pathname !== '/app/messages' ? 'hidden' : 'flex'}`}>
        {/* Header */}
        <div className="sticky top-0 z-20 bg-ui-white/90 backdrop-blur-md border-b border-ui-border px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-ui-text-main tracking-tight italic">Messages</h1>
            </div>

            {/* Search & Create */}
            <div className="flex items-center gap-2">
                <form onSubmit={(e) => e.preventDefault()} className="relative flex-grow">
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
                    autoComplete="off"
                  />
                </form>
                <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-create-group-modal'))}
                    className="w-11 h-11 shrink-0 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/20 active:scale-95 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
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
            {loadingConversations && conversations.length === 0 ? (
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
