import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

export default ChatPreview;
