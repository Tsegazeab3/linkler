import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SvgChats from './icons/Chats.jsx';
import SvgHome from './icons/Home.jsx';
import SvgSavedGuides from './icons/SavedGuides.jsx';
import SvgFellowTravelers from './icons/FellowTravelers.jsx';
import SvgGroups from './icons/Groups.jsx';
import SvgNewGuides from './icons/NewGuides.jsx';
import SvgSettings from './icons/Settings.jsx';

const SvgPromotions = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" />
  </svg>
);

const ChatPreview = ({ onSelect, conversation }) => {
  const lastMsg = conversation.last_message;
  return (
    <button onClick={onSelect} className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 overflow-hidden">
        {conversation.avatar ? (
          <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
        ) : (
          (conversation.name || 'Chat').charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <h4 className={`font-semibold text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
            {conversation.name || 'Personal Chat'}
          </h4>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
        <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
          {lastMsg ? lastMsg.text : 'No messages yet'}
        </p>
      </div>
      {conversation.unread_count > 0 && <div className="w-2 h-2 bg-[#3b82f6] rounded-full flex-shrink-0 self-center ml-2"></div>}
    </button>
  );
};

const GroupChatPreview = ({ conversation, ...props }) => (
    <div className="w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 overflow-hidden">
          {conversation.avatar ? (
            <img src={conversation.avatar} alt={conversation.name} className="w-full h-full object-cover" />
          ) : (
            (conversation.name || 'G').charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-grow overflow-hidden">
            <div className="flex justify-between items-center">
                <h4 className={`font-semibold text-sm truncate ${conversation.unread_count > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{conversation.name}</h4>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {conversation.last_message ? new Date(conversation.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
            </div>
            <p className={`text-xs truncate ${conversation.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                {conversation.last_message ? (
                  <>
                    <span className="font-medium">{conversation.last_message.sender_username}: </span>
                    {conversation.last_message.text}
                  </>
                ) : 'No messages yet'}
            </p>
        </div>
        {conversation.unread_count > 0 && <div className="w-2 h-2 bg-[#3b82f6] rounded-full flex-shrink-0 self-center ml-2"></div>}
    </div>
);

const PreviewList = ({ items, renderItem, emptyMessage }) => (
  <div className="space-y-2">
    {items.length > 0 ? items.map(item => renderItem(item)) : (
      <p className="text-gray-400 text-sm text-center py-4">{emptyMessage || 'Nothing here yet.'}</p>
    )}
  </div>
);


const SideNav = ({ onOpenChat, showSidePanel, selectedNavItemId, onPanelItemClick, onClosePanel }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [conversations, setConversations] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
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
    { id: 2, icon: SvgSavedGuides, name: 'Saved Guides', type: 'panel' },
    { id: 3, icon: SvgChats, name: 'Messages', type: 'panel' },
    { id: 4, icon: SvgGroups, name: 'Groups', type: 'panel' },
    { id: 5, icon: SvgFellowTravelers, name: 'Fellow Travelers', type: 'link', href: '/app/travelers' },
    { id: 6, icon: SvgNewGuides, name: 'New Guides', type: 'link', href: '/app/guides' },
    { id: 7, icon: SvgPromotions, name: 'Promotions', type: 'link', href: '/app/promotions' },
    { id: 8, icon: SvgSettings, name: 'Settings', type: 'panel' },
  ];
  
  const selectedNavItem = navItems.find(item => item.id === selectedNavItemId);

  const renderPanelContent = () => {
    if (!selectedNavItem && selectedNavItemId !== 'user_profile') return null;

    if (selectedNavItemId === 'user_profile') {
      return (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold text-lg">{user.username}</h4>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <button 
                  onClick={logout}
                  className="w-full py-2 bg-red-500/10 text-red-500 rounded-lg font-semibold hover:bg-red-500/20 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-300 mb-4">You are not logged in.</p>
              <Link to="/signin" className="inline-block px-6 py-2 bg-[#3b82f6] text-white rounded-lg font-bold">Sign In</Link>
            </div>
          )}
        </div>
      );
    }

    if (loading) return <div className="text-center py-10 animate-pulse text-gray-400">Loading...</div>;

    switch (selectedNavItem.name) {
      case 'Messages':
        return (
          <PreviewList 
            items={conversations.filter(c => c.type === 'dm')} 
            renderItem={conv => <ChatPreview key={conv.id} conversation={conv} onSelect={() => onOpenChat(conv, 'dm')} />} 
            emptyMessage="No direct messages yet."
          />
        );
      case 'Saved Guides':
        return <p className="text-gray-400 text-center py-10">You haven&apos;t saved any guides yet.</p>;
      case 'Groups':
        return (
          <PreviewList 
            items={conversations.filter(c => c.type === 'group')} 
            renderItem={conv => (
              <Link to={`/app/groups/${conv.id}`} key={conv.id} onClick={onClosePanel}>
                <GroupChatPreview conversation={conv} />
              </Link>
            )} 
            emptyMessage="You haven&apos;t joined any groups yet."
          />
        );
      case 'Settings':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
              <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Account</h4>
              <button className="w-full text-left text-gray-600 hover:text-gray-900 flex justify-between items-center py-1">
                <span>Profile Settings</span>
                <span className="text-xs text-gray-400">→</span>
              </button>
              <button className="w-full text-left text-gray-600 hover:text-gray-900 flex justify-between items-center py-1">
                <span>Privacy & Security</span>
                <span className="text-xs text-gray-400">→</span>
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
              <h4 className="text-gray-900 font-bold text-sm uppercase tracking-wider">Notifications</h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Push Notifications</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full cursor-pointer relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
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
        <span className="text-[10px] mt-0.5">{item.name}</span>
      </>
    );

    const baseClasses = "flex flex-col items-center justify-center w-full py-3 px-1 transition-colors duration-200 focus:outline-none";
    const inactiveClasses = "hover:bg-blue-50 text-gray-600";
    const activeClasses = "bg-blue-100 text-[#3b82f6]";

    if (item.type === 'link') {
      const handleClick = item.name === 'Home' ? onClosePanel : null;
      return (
        <Link to={item.href} onClick={handleClick} className={`${baseClasses} ${inactiveClasses}`}>
          {content}
        </Link>
      );
    }

    return (
      <button
        onClick={() => onPanelItemClick(item.id)}
        className={`${baseClasses} ${selectedNavItemId === item.id ? activeClasses : inactiveClasses}`}
        aria-label={item.name}
        aria-expanded={selectedNavItemId === item.id && showSidePanel}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <div className="hidden lg:flex fixed top-0 left-0 h-full bg-[var(--color-linkler-bg)] text-black flex-col z-[41] w-20 shadow-sm">
        <nav className="flex-grow flex flex-col items-center pt-8 overflow-y-auto no-scrollbar">
          <ul className="w-full">
            {navItems.map((item) => (
              <li key={item.id} className="mb-1 w-full text-center">
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
                className={`relative group flex flex-col items-center w-full px-2 cursor-pointer py-2 hover:bg-gray-50 transition-colors ${selectedNavItemId === 'user_profile' ? 'bg-gray-100' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] font-bold text-base border-2 border-white shadow-sm overflow-hidden">
                    <img src={user.profile_picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'} alt={user.username} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 truncate w-full text-center px-1 font-medium">
                  {user.username}
                </span>

                {/* Tooltip/Popout for Username and Email */}
                <div className="absolute left-full bottom-8 ml-2 hidden group-hover:block w-56 bg-white shadow-2xl rounded-xl p-4 border border-gray-100 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-50">
                     <div className="w-10 h-10 rounded-full bg-[#3b82f6] flex items-center justify-center text-white font-bold shrink-0">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm text-gray-900 truncate">{user.username}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={logout}
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
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="h-2 w-10 bg-gray-200 mt-2 rounded" />
              </div>
            )
          ) : null}
        </div>
      </div>

      {showSidePanel && (
        <div
          className="fixed top-0 left-0 lg:left-20 h-full bg-white w-full lg:w-80 p-4 border-r border-gray-200 z-[42] shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">{selectedNavItem?.name || 'Profile'}</h3>
            <button onClick={onClosePanel} className="text-gray-400 hover:text-gray-600 focus:outline-none text-xl" aria-label="Close side panel">
              ✕
            </button>
          </div>
          <div className="overflow-y-auto h-full pb-20">
            {renderPanelContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default SideNav;
