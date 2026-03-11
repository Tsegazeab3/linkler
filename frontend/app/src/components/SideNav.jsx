import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SvgChats from './icons/Chats.jsx';
import SvgHome from './icons/Home.jsx';
import SvgSavedGuides from './icons/SavedGuides.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgGroups from './icons/Groups.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';
import SvgPromotions from './icons/Promotions.jsx';
import SvgSettings from './icons/Settings.jsx';

const SvgSearch = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const ChatPreview = ({ onSelect, conversation }) => {
  const lastMsg = conversation.last_message;
  return (
    <button onClick={onSelect} className="w-full text-left p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 flex items-center space-x-3 group border border-transparent hover:border-gray-100">
      <Avatar className="w-12 h-12 border border-blue-100/50 shadow-sm group-hover:shadow transition-shadow bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 font-bold">
        <AvatarImage src={conversation.avatar} alt={conversation.name} className="object-cover" />
        <AvatarFallback>{(conversation.name || 'Chat').charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className={`font-semibold text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
            {conversation.name || 'Personal Chat'}
          </h4>
          <span className="text-[10px] text-gray-400 flex-shrink-0 font-medium whitespace-nowrap ml-2">
            {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
          {lastMsg ? lastMsg.text : 'No messages yet'}
        </p>
      </div>
      {conversation.unread_count > 0 && <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full flex-shrink-0 self-center ml-2 ring-4 ring-blue-50"></div>}
    </button>
  );
};

const GroupChatPreview = ({ conversation, ...props }) => (
    <div className="w-full text-left p-3 rounded-xl hover:bg-gray-50/80 transition-all duration-200 flex items-center space-x-3 group border border-transparent hover:border-gray-100">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Avatar className="w-full h-full rounded-2xl border border-indigo-100/50 shadow-sm group-hover:shadow transition-shadow bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-600 font-bold">
            <AvatarImage src={conversation.avatar} alt={conversation.name} className="object-cover rounded-2xl" />
            <AvatarFallback className="rounded-2xl">{(conversation.name || 'Group').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {/* Small group indicator badge */}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
            <SvgGroups className="w-3.5 h-3.5 text-indigo-400" />
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
            <div className="flex justify-between items-center mb-0.5">
                <h4 className={`font-semibold text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{conversation.name}</h4>
                <span className="text-[10px] text-gray-400 flex-shrink-0 font-medium whitespace-nowrap ml-2">
                  {conversation.last_message ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
            </div>
            <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {conversation.last_message ? (
                  <>
                    <span className="font-semibold text-gray-700">{conversation.last_message.sender_username}: </span>
                    {conversation.last_message.text}
                  </>
                ) : 'No messages yet'}
            </p>
        </div>
        {conversation.unread_count > 0 && <div className="w-2.5 h-2.5 bg-[#3b82f6] rounded-full flex-shrink-0 self-center ml-2 ring-4 ring-blue-50"></div>}
    </div>
);

const PreviewList = ({ items, renderItem, emptyMessage }) => (
  <div className="space-y-2">
    {items.length > 0 ? items.map(item => renderItem(item)) : (
      <p className="text-gray-400 text-sm text-center py-4">{emptyMessage || 'Nothing here yet.'}</p>
    )}
  </div>
);


const SideNav = ({ onOpenChat, showSidePanel, selectedNavItemId, onPanelItemClick, onClosePanel, onOpenSearch }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);

  // Reset search when panel changes
  useEffect(() => {
    setSearchQuery('');
  }, [selectedNavItemId]);

  useEffect(() => {
    if (isAuthenticated && (selectedNavItemId === 3 || selectedNavItemId === 4)) {
      setLoading(true);
      import('../services/api').then(({ getConversations }) => {
        getConversations()
          .then(res => setConversations(res.data))
          .catch(err => console.error('Chat error:', err))
          .finally(() => setLoading(false));
      });
    }
  }, [isAuthenticated, selectedNavItemId]);
  
  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
  
  const navItems = [
    { id: 1, icon: SvgHome, name: 'Home', type: 'link', href: '/app' },
    { id: 9, icon: SvgSearch, name: 'Search', type: 'button', onClick: onOpenSearch },
    { id: 2, icon: SvgSavedGuides, name: 'Saved Guides', type: 'panel' },
    { id: 3, icon: SvgChats, name: 'Messages', type: 'panel' },
    { id: 4, icon: SvgGroups, name: 'Groups', type: 'panel' },
    { id: 5, icon: SvgFellowTravelers, name: 'Fellow Travelers', type: 'link', href: '/app/travelers' },
    { id: 6, icon: SvgNewGuides, name: 'New Guides', type: 'link', href: '/app/guides' },
    { id: 7, icon: SvgPromotions, name: 'Deals', type: 'link', href: '/app/promotions' },
    { id: 8, icon: SvgSettings, name: 'Settings', type: 'link', href: '/app/settings' },
  ];
  
  const selectedNavItem = navItems.find(item => item.id === selectedNavItemId);

  const renderPanelContent = () => {
    if (!selectedNavItem && selectedNavItemId !== 'user_profile') return null;

    if (selectedNavItemId === 'user_profile') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-2xl border border-blue-100/50 shadow-sm">
            {user ? (
              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-white shadow-sm text-2xl font-bold text-[#3b82f6] bg-white">
                    <AvatarImage src={user.profile_picture} alt={user.username} className="object-cover" />
                    <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <h4 className="text-gray-900 font-bold text-lg truncate">{user.username}</h4>
                    <p className="text-gray-500 text-sm truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to={`/app/profile/${user.id}`} onClick={onClosePanel} className="text-center py-2 bg-white text-gray-700 rounded-xl font-semibold shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                    View Profile
                  </Link>
                  <Link to="/app/settings" onClick={onClosePanel} className="text-center py-2 bg-white text-gray-700 rounded-xl font-semibold shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors text-sm">
                    Settings
                  </Link>
                </div>

                <div className="pt-4 border-t border-blue-100/50">
                  <button 
                    onClick={logout}
                    className="w-full py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-6 font-medium">Join our community to connect with other travelers.</p>
                <Link to="/signin" className="block w-full py-3 bg-[#3b82f6] text-white rounded-xl font-bold shadow-md hover:bg-blue-600 transition-colors active:scale-95">Sign In / Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const filteredDMs = conversations.filter(c => c.type === 'dm' && (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery));
    const filteredGroups = conversations.filter(c => c.type === 'group' && (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery));

    const EmptyState = ({ icon, title, desc, action }) => (
      <div className="text-center py-10 px-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h4 className="text-gray-900 font-bold mb-1">{title}</h4>
        <p className="text-gray-500 text-sm mb-6">{desc}</p>
        {action}
      </div>
    );

    const SearchBar = ({ placeholder }) => (
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <Input
          type="text"
          className="pl-9 bg-gray-50"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    );

    switch (selectedNavItem.name) {
      case 'Messages':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SearchBar placeholder="Search messages..." />
            <PreviewList 
              items={filteredDMs} 
              renderItem={conv => <ChatPreview key={conv.id} conversation={conv} onSelect={() => onOpenChat(conv, 'dm')} />} 
              emptyMessage={
                <EmptyState 
                  icon={<SvgChats className="w-8 h-8" />}
                  title="No messages yet"
                  desc="Start a conversation with fellow travelers."
                  action={
                    <Button>
                      Find Travelers
                    </Button>
                  }
                />
              }
            />
          </div>
        );
      case 'Saved Guides':
        return (
          <EmptyState 
            icon={<SvgSavedGuides className="w-8 h-8" />}
            title="No Saved Guides"
            desc="Guides you save will appear here for easy access during your trip."
            action={
              <Button asChild>
                <Link to="/app/guides" onClick={onClosePanel}>
                  Explore Guides
                </Link>
              </Button>
            }
          />
        );
      case 'Groups':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SearchBar placeholder="Search groups..." />
            <PreviewList 
              items={filteredGroups} 
              renderItem={conv => (
                <Link to={`/app/chat/${conv.id}`} key={conv.id} onClick={onClosePanel}>
                  <GroupChatPreview conversation={conv} />
                </Link>
              )} 
              emptyMessage={
                <EmptyState 
                  icon={<SvgGroups className="w-8 h-8" />}
                  title="No Groups Joined"
                  desc="Join a group to connect with travelers going to similar destinations."
                  action={
                    <Button>
                      Discover Groups
                    </Button>
                  }
                />
              }
            />
          </div>
        );
      case 'Settings':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gray-50/50 p-4 rounded-2xl space-y-3 border border-gray-100">
              <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Account</h4>
              
              <button className="w-full text-left bg-white px-4 py-3 rounded-xl border border-gray-100 text-gray-700 hover:text-gray-900 flex justify-between items-center shadow-sm hover:shadow transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className="font-semibold text-sm">Profile Details</span>
                </div>
                <span className="text-gray-300 group-hover:text-blue-500 transition-colors">→</span>
              </button>

              <button className="w-full text-left bg-white px-4 py-3 rounded-xl border border-gray-100 text-gray-700 hover:text-gray-900 flex justify-between items-center shadow-sm hover:shadow transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <span className="font-semibold text-sm">Privacy & Security</span>
                </div>
                <span className="text-gray-300 group-hover:text-green-500 transition-colors">→</span>
              </button>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-2xl space-y-3 border border-gray-100">
              <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">Preferences</h4>
              
              <div className="bg-white px-4 py-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                  <span className="font-semibold text-gray-700 text-sm">Push Notifications</span>
                </div>
                <button 
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${pushEnabled ? 'bg-[#3b82f6]' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
            
            <p className="text-center text-xs text-gray-400 font-medium pt-4">Linkler v1.0.0</p>
          </div>
        );
      default:
        return <p className="text-gray-400 text-center py-10">Content for {selectedNavItem.name} goes here.</p>;
    }
  };
  
  const renderNavItem = (item) => {
    const Icon = item.icon;
    const content = (
      <>
        <span className="relative mb-0.5">
          <Icon className="w-7 h-7" />
          {(item.name === 'Messages' || item.name === 'Groups') && totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-[var(--color-linkler-bg)]">
              {totalUnread}
            </span>
          )}
        </span>
        <span className="text-[10px] mt-0.5 leading-tight text-center px-1 w-full">{item.name}</span>
      </>
    );

    const baseClasses = "flex flex-col items-center justify-center w-full py-3 px-1 transition-colors duration-200 focus:outline-none";
    const inactiveClasses = "hover:bg-blue-50 text-gray-500";
    const activeClasses = "bg-blue-100 text-[#3b82f6]";

    if (item.type === 'link') {
      const isLinkActive = location.pathname === item.href || (item.href !== '/app' && location.pathname.startsWith(item.href));
      const handleClick = item.name === 'Home' ? onClosePanel : null;
      return (
        <Link
          to={item.href}
          onClick={handleClick}
          className={`${baseClasses} ${isLinkActive ? activeClasses : inactiveClasses}`}
        >
          {content}
        </Link>
      );
    }

    if (item.type === 'button' && item.onClick) {
      return (
        <button
          onClick={item.onClick}
          className={`${baseClasses} ${inactiveClasses}`}
          aria-label={item.name}
        >
          {content}
        </button>
      );
    }

    return (
      <button
        onClick={() => onPanelItemClick(item.id)}
        className={`${baseClasses} ${selectedNavItemId === item.id && showSidePanel ? activeClasses : inactiveClasses}`}
        aria-label={item.name}
        aria-expanded={selectedNavItemId === item.id && showSidePanel}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      {/* Desktop sidebar icon rail */}
      <div className="hidden lg:flex fixed top-0 left-0 h-full bg-[var(--color-linkler-bg)] text-black flex-col z-50 w-20 border-r border-gray-100">
        <nav className="flex-grow flex flex-col items-center pt-6 overflow-y-auto no-scrollbar">
          <ul className="w-full space-y-0.5">
            {navItems.map((item) => (
              <li key={item.id} className="w-full">
                {renderNavItem(item)}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pb-4 flex flex-col items-center border-t border-gray-100 pt-4">
          {isAuthenticated ? (
            user ? (
              <div
                onClick={() => onPanelItemClick('user_profile')}
                className={`relative group flex flex-col items-center w-full px-2 cursor-pointer py-2 rounded-lg mx-1 hover:bg-blue-50 transition-colors ${selectedNavItemId === 'user_profile' ? 'bg-blue-100' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] font-bold text-base border-2 border-white shadow-sm overflow-hidden">
                  <img
                    src={user.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center px-1 font-medium leading-tight">
                  {user.username}
                </span>

                {/* Hover tooltip */}
                <div className="absolute left-full bottom-2 ml-3 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 w-56 bg-white shadow-2xl rounded-xl p-4 border border-gray-100 z-50">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center text-white font-bold shrink-0">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-gray-900 truncate">{user.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); logout(); }}
                    className="w-full text-left p-2.5 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="h-2 w-10 bg-gray-200 mt-2 rounded" />
              </div>
            )
          ) : null}
        </div>
      </div>

      {/* Side panel — slides in on desktop, full-screen overlay on mobile */}
      <div
        className={[
          'fixed top-0 h-full bg-white border-r border-gray-200 z-[42] shadow-xl',
          'transition-transform duration-300 ease-in-out',
          'w-full lg:w-80',
          // On mobile, start right-to-left; on desktop, anchor to left-20
          showSidePanel
            ? 'translate-x-0 left-0 lg:left-20'
            : '-translate-x-full left-0 lg:left-20 pointer-events-none',
        ].join(' ')}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 tracking-tight">
            {selectedNavItem?.name || 'Profile'}
          </h3>
          <button
            onClick={onClosePanel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Close side panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-full pb-24 px-4 pt-3">
          {renderPanelContent()}
        </div>
      </div>
    </>
  );
};

export default SideNav;
