import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConversations } from '../services/api';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then(res => {
        setGroups(res.data.filter(c => c.type === 'group'));
      })
      .catch(err => console.error('Error fetching groups:', err))
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
      <h1 className="text-2xl font-bold mb-6">Groups</h1>
      <div className="space-y-4">
        {groups.length > 0 ? (
          groups.map(group => (
            <Link
              to={`/app/groups/${group.id}`}
              key={group.id}
              className="w-full text-left p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center space-x-4"
            >
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 overflow-hidden">
                {group.avatar ? (
                  <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
                ) : (
                  (group.name || 'G').charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900 truncate text-lg">{group.name || 'Group Chat'}</h4>
                </div>
                <div className="text-sm truncate text-gray-500 flex items-center gap-1">
                    {group.last_message && (
                        <>
                            <span className="font-medium text-gray-800">{group.last_message.sender_username}:</span>
                            <span>{group.last_message.text}</span>
                        </>
                    )}
                    {!group.last_message && <span>No messages yet</span>}
                </div>
              </div>
              {group.unread_count > 0 && (
                <div className="bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                  {group.unread_count}
                </div>
              )}
            </Link>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500 italic">
            You haven&apos;t joined any travel groups yet. Find fellow travelers to join one!
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsPage;