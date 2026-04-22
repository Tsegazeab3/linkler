import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
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
    <button onClick={onSelect} className="w-full text-left p-3 rounded-xl hover:bg-ui-bg-alt/80 transition-all duration-200 flex items-center space-x-3 group border border-transparent hover:border-ui-border">
      <Avatar className="w-12 h-12 border border-brand/20 shadow-sm group-hover:shadow transition-shadow bg-gradient-to-br from-brand-light to-accent-indigo/10 text-brand font-bold">
        <AvatarImage src={conversation.avatar} alt={conversation.name} className="object-cover" />
        <AvatarFallback>{(conversation.name || 'Chat').charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className={`font-semibold text-sm truncate ${conversation.unread_count > 0 ? 'text-ui-text-main' : 'text-ui-text-secondary'}`}>
            {conversation.name || 'Personal Chat'}
          </h4>
          <span className="text-[10px] text-ui-muted flex-shrink-0 font-medium whitespace-nowrap ml-2">
            {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-ui-text-main font-medium' : 'text-ui-text-secondary'}`}>
          {lastMsg ? lastMsg.text : 'No messages yet'}
        </p>
      </div>
      {conversation.unread_count > 0 && <div className="w-2.5 h-2.5 bg-brand rounded-full flex-shrink-0 self-center ml-2 ring-4 ring-brand/10"></div>}
    </button>
  );
};

const GroupChatPreview = ({ conversation, ...props }) => (
    <div className="w-full text-left p-3 rounded-xl hover:bg-ui-bg-alt/80 transition-all duration-200 flex items-center space-x-3 group border border-transparent hover:border-ui-border">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Avatar className="w-full h-full rounded-2xl border border-accent-indigo/20 shadow-sm group-hover:shadow transition-shadow bg-gradient-to-br from-accent-indigo/10 to-accent-purple/10 text-accent-indigo font-bold">
            <AvatarImage src={conversation.avatar} alt={conversation.name} className="object-cover rounded-2xl" />
            <AvatarFallback className="rounded-2xl">{(conversation.name || 'Group').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          {/* Small group indicator badge */}
          <div className="absolute -bottom-1 -right-1 bg-ui-white rounded-full p-0.5 shadow-sm border border-ui-border">
            <SvgGroups className="w-3.5 h-3.5 text-accent-indigo/60" />
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
            <div className="flex justify-between items-center mb-0.5">
                <h4 className={`font-semibold text-sm truncate ${conversation.unread_count > 0 ? 'text-ui-text-main' : 'text-ui-text-secondary'}`}>{conversation.name}</h4>
                <span className="text-[10px] text-ui-muted flex-shrink-0 font-medium whitespace-nowrap ml-2">
                  {conversation.last_message ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
            </div>
            <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-ui-text-main font-medium' : 'text-ui-text-secondary'}`}>
                {conversation.last_message ? (
                  <>
                    <span className="font-semibold text-ui-text-secondary">{conversation.last_message.sender_username}: </span>
                    {conversation.last_message.text}
                  </>
                ) : 'No messages yet'}
            </p>
        </div>
        {conversation.unread_count > 0 && <div className="w-2.5 h-2.5 bg-brand rounded-full flex-shrink-0 self-center ml-2 ring-4 ring-brand/10"></div>}
    </div>
);

const PreviewList = ({ items, renderItem, emptyMessage }) => (
  <div className="space-y-2">
    {items.length > 0 ? items.map(item => renderItem(item)) : (
      <div className="text-ui-muted text-sm text-center py-4 font-medium italic">{emptyMessage || 'Nothing here yet.'}</div>
    )}
  </div>
);


const EmptyState = ({ icon, title, desc, action }) => (
  <div className="text-center py-10 px-4 animate-in fade-in duration-500">
    <div className="w-16 h-16 bg-brand-light text-brand/60 rounded-full flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h4 className="text-ui-text-main font-bold mb-1">{title}</h4>
    <p className="text-ui-text-secondary text-sm mb-6">{desc}</p>
    {action}
  </div>
);

const SearchBar = ({ placeholder, className = "", value, onChange }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="h-4 w-4 text-ui-muted" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
    </div>
    <form onSubmit={(e) => e.preventDefault()}>
      <Input
        id={`search-${placeholder.replace(/\s+/g, '-').toLowerCase()}`}
        name="search"
        type="text"
        className="pl-9 bg-ui-bg"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
    </form>
  </div>
);

const SideNav = ({ onOpenChat, showSidePanel, selectedNavItemId, onPanelItemClick, onClosePanel, onOpenSearch, selectedUser }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { conversations, loadingConversations } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingLoadingNotifications] = useState(false);

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  // Reset search when panel changes
  useEffect(() => {
    setSearchQuery('');
    if (selectedNavItemId === 11) {
        fetchNotifications();
    }
  }, [selectedNavItemId]);

  const fetchNotifications = async () => {
    setLoadingLoadingNotifications(true);
    import('../services/api').then(async ({ getNotifications }) => {
        try {
            const res = await getNotifications();
            setNotifications(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } catch (err) { console.error(err); }
        finally { setLoadingLoadingNotifications(false); }
    });
  };

  const handleMarkRead = async (id) => {
    import('../services/api').then(async ({ markNotificationRead }) => {
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) { console.error(err); }
    });
  };

  const totalUnread = Array.isArray(conversations) ? conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0) : 0;
  const unreadNotifications = user?.unread_notifications_count || notifications.filter(n => !n.is_read).length;
  
  const navItems = [
    { id: 1, icon: SvgHome, name: 'Home', type: 'link', href: '/app' },
    { id: 9, icon: SvgSearch, name: 'Search', type: 'button', onClick: onOpenSearch },
    { id: 2, icon: SvgSavedGuides, name: 'Saved Guides', type: 'panel' },
    { id: 3, icon: SvgChats, name: 'Messages', type: 'panel' },
    { id: 4, icon: SvgGroups, name: 'Groups', type: 'panel' },
    { id: 11, icon: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, name: 'Alerts', type: 'panel' },
    ...(user?.account_type === 'guide' || user?.account_type === 'service' ? [
        { id: 10, icon: () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, name: 'Dashboard', type: 'link', href: '/app/dashboard' }
    ] : []),
    { id: 5, icon: SvgFellowTravelers, name: 'Fellow Travelers', type: 'link', href: '/app/travelers' },
    { id: 6, icon: SvgNewGuides, name: 'New Guides', type: 'link', href: '/app/guides' },
    { id: 7, icon: SvgPromotions, name: 'Deals', type: 'link', href: '/app/promotions' },
    { id: 8, icon: SvgSettings, name: 'Settings', type: 'link', href: '/app/settings' },
  ];
  
  const selectedNavItem = navItems.find(item => item.id === selectedNavItemId);

  const renderPanelContent = () => {
    if (!selectedNavItem && selectedNavItemId !== 'user_profile' && selectedNavItemId !== 'peer_profile') return null;

    if (selectedNavItemId === 'peer_profile' && selectedUser) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-5 bg-gradient-to-br from-brand-light to-accent-indigo/10 rounded-2xl border border-brand/20 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 border-2 border-ui-white shadow-sm text-2xl font-bold text-brand bg-ui-white">
                  <AvatarImage src={selectedUser.profile_picture || selectedUser.avatar} alt={selectedUser.username || selectedUser.name} className="object-cover" />
                  <AvatarFallback>{(selectedUser.username || selectedUser.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <h4 className="text-ui-text-main font-bold text-lg truncate">{selectedUser.username || selectedUser.name}</h4>
                  <p className="text-ui-text-secondary text-sm truncate">{selectedUser.account_type || 'Traveler'}</p>
                </div>
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-ui-text-secondary italic">"{selectedUser.bio || 'No bio yet.'}"</p>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                <Link to={`/app/profile/${selectedUser.username || selectedUser.name}`} onClick={onClosePanel} className="text-center py-2.5 bg-brand text-white rounded-xl font-bold shadow-md hover:bg-brand-hover transition-colors text-sm">
                  View Full Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedNavItemId === 'user_profile') {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-5 bg-gradient-to-br from-brand-light to-accent-indigo/10 rounded-2xl border border-brand/20 shadow-sm">
            {user ? (
              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-ui-white shadow-sm text-2xl font-bold text-brand bg-ui-white">
                    <AvatarImage src={user.profile_picture} alt={user.username} className="object-cover" />
                    <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <h4 className="text-ui-text-main font-bold text-lg truncate">{user.username}</h4>
                    <p className="text-ui-text-secondary text-sm truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to={`/app/profile/${user.username}`} onClick={onClosePanel} className="text-center py-2 bg-ui-white text-ui-text-secondary rounded-xl font-semibold shadow-sm border border-ui-border hover:bg-ui-bg-alt transition-colors text-sm">
                    View Profile
                  </Link>
                  <Link to="/app/settings" onClick={onClosePanel} className="text-center py-2 bg-ui-white text-ui-text-secondary rounded-xl font-semibold shadow-sm border border-ui-border hover:bg-ui-bg-alt transition-colors text-sm">
                    Settings
                  </Link>
                </div>

                <div className="pt-4 border-t border-brand/20">
                  <button 
                    onClick={logout}
                    className="w-full py-2.5 bg-error-light text-error rounded-xl font-bold hover:bg-error/10 transition-colors flex items-center justify-center gap-2"
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
                <div className="w-16 h-16 rounded-full bg-brand-light text-brand flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-ui-text-secondary mb-6 font-medium">Join our community to connect with other travelers.</p>
                <Link to="/signin" className="block w-full py-3 bg-brand text-white rounded-xl font-bold shadow-md hover:bg-brand-hover transition-colors active:scale-95">Sign In / Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (loadingConversations) {
      return (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center space-x-3 p-2">
              <div className="w-10 h-10 rounded-full bg-ui-bg-alt flex-shrink-0"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-ui-bg-alt rounded w-3/4"></div>
                <div className="h-3 bg-ui-bg rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const filteredDMs = Array.isArray(conversations) ? conversations.filter(c => c.type === 'dm' && (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)) : [];
    const filteredGroups = Array.isArray(conversations) ? conversations.filter(c => c.type === 'group' && (c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)) : [];

    switch (selectedNavItem.name) {
      case 'Messages':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SearchBar 
              placeholder="Search messages..." 
              className="mb-4" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <PreviewList 
              items={filteredDMs} 
              renderItem={conv => <ChatPreview key={conv.id} conversation={conv} onSelect={() => onOpenChat(conv, 'dm')} />} 
              emptyMessage={
                <EmptyState 
                  icon={<SvgChats className="w-8 h-8" />}
                  title="No messages yet"
                  desc="Start a conversation with fellow travelers."
                  action={
                    <Button onClick={() => onPanelItemClick(5)}>
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
            <div className="flex gap-2 mb-4">
                <SearchBar 
                  placeholder="Search your groups..." 
                  className="flex-1" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-discover-groups-modal'))}
                    className="shrink-0 rounded-xl border-brand/20 text-brand hover:bg-brand hover:text-white"
                    title="Discover Public Groups"
                >
                    <SvgSearch className="w-5 h-5" />
                </Button>
            </div>
            <PreviewList 
              items={filteredGroups} 
              renderItem={conv => (
                <Link to={`/app/messages/${conv.id}`} key={conv.id} onClick={onClosePanel}>
                  <GroupChatPreview conversation={conv} />
                </Link>
              )} 
              emptyMessage={
                <EmptyState 
                  icon={<SvgGroups className="w-8 h-8" />}
                  title="No Groups Joined"
                  desc="Join a group to connect with travelers going to similar destinations."
                  action={
                    <Button asChild>
                        <Link to="/app" onClick={onClosePanel}>Go to Home to Create Group</Link>
                    </Button>
                  }
                />
              }
            />
          </div>
        );
      case 'Alerts':
        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {loadingNotifications ? (
                    <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div></div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-2">
                        {notifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => { handleMarkRead(n.id); n.link && navigate(n.link); n.link && onClosePanel(); }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.is_read ? 'bg-ui-white border-ui-border opacity-60' : 'bg-brand/5 border-brand/20 shadow-sm'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className={`text-xs font-black uppercase tracking-tight ${n.is_read ? 'text-ui-text-secondary' : 'text-brand'}`}>{n.title}</h5>
                                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />}
                                </div>
                                <p className="text-xs text-ui-text-secondary line-clamp-2">{n.message}</p>
                                <p className="text-[9px] text-ui-muted mt-2 font-bold uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                        title="No alerts"
                        desc="You're all caught up! New notifications will appear here."
                    />
                )}
            </div>
        );
      case 'Settings':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-ui-bg-alt/50 p-4 rounded-2xl space-y-3 border border-ui-border">
              <h4 className="text-ui-muted font-bold text-xs uppercase tracking-wider mb-2">Account</h4>
              
              <button onClick={() => navigate('/app/settings')} className="w-full text-left bg-ui-white px-4 py-3 rounded-xl border border-ui-border text-ui-text-secondary hover:text-ui-text-main flex justify-between items-center shadow-sm hover:shadow transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className="font-semibold text-sm">Profile Details</span>
                </div>
                <span className="text-ui-border group-hover:text-brand transition-colors">→</span>
              </button>

              <button className="w-full text-left bg-ui-white px-4 py-3 rounded-xl border border-ui-border text-ui-text-secondary hover:text-ui-text-main flex justify-between items-center shadow-sm hover:shadow transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center text-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <span className="font-semibold text-sm">Privacy & Security</span>
                </div>
                <span className="text-ui-border group-hover:text-success transition-colors">→</span>
              </button>
            </div>

            <div className="bg-ui-bg-alt/50 p-4 rounded-2xl space-y-3 border border-ui-border">
              <h4 className="text-ui-muted font-bold text-xs uppercase tracking-wider mb-2">Preferences</h4>
              
              <div className="bg-ui-white px-4 py-3 rounded-xl border border-ui-border flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-warning-light flex items-center justify-center text-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                  <span className="font-semibold text-ui-text-secondary text-sm">Push Notifications</span>
                </div>
                <button 
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${pushEnabled ? 'bg-brand' : 'bg-ui-bg-alt'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-ui-white rounded-full transition-transform shadow-sm ${pushEnabled ? 'translate-x-6' : 'translate-x-1'}`}></div>
                </button>
              </div>
            </div>
            
            <p className="text-center text-xs text-ui-muted font-medium pt-4">Linkler v1.0.0</p>
          </div>
        );
      default:
        return <p className="text-ui-muted text-center py-10">Content for {selectedNavItem.name} goes here.</p>;
    }
  };
  
  const renderNavItem = (item) => {
    const Icon = item.icon;
    const content = (
      <>
        <span className="relative mb-0.5">
          <Icon className="w-7 h-7" />
          {((item.name === 'Messages' || item.name === 'Groups') && totalUnread > 0) && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-[var(--color-linkler-bg)]">
              {totalUnread}
            </span>
          )}
          {(item.name === 'Alerts' && unreadNotifications > 0) && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-[var(--color-linkler-bg)]">
              {unreadNotifications}
            </span>
          )}
        </span>
        <span className="text-[10px] mt-0.5 leading-tight text-center px-1 w-full">{item.name}</span>
      </>
    );

    const baseClasses = "flex flex-col items-center justify-center w-full py-3 px-1 transition-colors duration-200 focus:outline-none";
    const inactiveClasses = "hover:bg-brand-light text-ui-text-secondary";
    const activeClasses = "bg-brand-light text-brand font-bold";

    if (item.type === 'link') {
      const isLinkActive = location.pathname === item.href || 
                          (item.href !== '/app' && location.pathname.startsWith(item.href)) ||
                          (item.name === 'Settings' && location.pathname.includes('settings'));
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
      <div className="hidden lg:flex fixed top-0 left-0 h-full bg-ui-white text-ui-text-main flex-col z-50 w-20 border-r border-ui-border">
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
        <div className="mt-auto pb-4 flex flex-col items-center border-t border-ui-border pt-4 space-y-4">
          {isAuthenticated ? (
            user ? (
              <div
                onClick={() => { onClosePanel(); navigate(`/app/profile/${user.username}`); }}
                className={`relative group flex flex-col items-center w-full px-2 cursor-pointer py-2 rounded-lg mx-1 hover:bg-brand-light transition-colors ${location.pathname === `/app/profile/${user.username}` ? 'bg-brand-light' : ''}`}
              >
                <Avatar className="w-10 h-10 border-2 border-ui-white shadow-sm text-base font-bold text-brand bg-ui-white">
                  <AvatarImage src={getMediaUrl(user.profile_picture)} alt={user.username} className="object-cover" />
                  <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-[10px] text-ui-muted mt-1 truncate w-full text-center px-1 font-medium leading-tight">
                  {user.username}
                </span>

                {/* Hover tooltip - Simplified */}
                <div className="absolute left-full bottom-2 ml-3 pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 w-48 bg-ui-white shadow-2xl rounded-xl p-3 border border-ui-border z-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs text-ui-text-main truncate">{user.username}</p>
                      <p className="text-[10px] text-ui-muted truncate">View Profile</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-10 h-10 rounded-full bg-ui-bg-alt" />
                <div className="h-2 w-10 bg-ui-bg-alt mt-2 rounded" />
              </div>
            )
          ) : null}
        </div>
      </div>

      {/* Side panel — slides in on desktop, full-screen overlay on mobile */}
      <div
        className={[
          'fixed top-0 h-full bg-ui-white border-r border-ui-border z-[42] shadow-xl',
          'transition-transform duration-300 ease-in-out',
          'w-full lg:w-80',
          // On mobile, start right-to-left; on desktop, anchor to left-20
          showSidePanel
            ? 'translate-x-0 left-0 lg:left-20'
            : '-translate-x-full left-0 lg:left-20 pointer-events-none',
        ].join(' ')}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-ui-border">
          <h3 className="text-base font-bold text-ui-text-main tracking-tight">
            {selectedNavItem?.name || 'Profile'}
          </h3>
          <button
            onClick={onClosePanel}
            className="w-8 h-8 flex items-center justify-center rounded-full text-ui-muted hover:text-ui-text-main hover:bg-ui-bg-alt transition-colors focus:outline-none"
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
