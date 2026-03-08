import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getConversations } from '../services/api';

const MessagesPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { handleOpenChat } = useOutletContext() || {};

  useEffect(() => {
    getConversations()
      .then(res => {
        setConversations(res.data.filter(c => c.type === 'dm'));
      })
      .catch(err => console.error('Error fetching messages:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="space-y-2">
        {conversations.length > 0 ? (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => handleOpenChat && handleOpenChat(conv, 'dm')}
              className="w-full text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden">
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                ) : (
                  (conv.name || 'Chat').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 truncate">{conv.name || 'Chat'}</h4>
                  {conv.last_message && (
                    <span className="text-xs text-gray-400">
                      {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${conv.unread_count > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {conv.last_message?.text || 'No messages yet'}
                </p>
              </div>
              {conv.unread_count > 0 && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></div>
              )}
            </button>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500 italic">
            No messages yet. Start a conversation with a guide or traveler!
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;