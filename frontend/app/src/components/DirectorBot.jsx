import React, { useState, useEffect, useRef } from 'react';
import { useDirector } from '../context/DirectorContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DirectorBot = () => {
  const { isActive, startPresentation, messages, processMessage, isTyping, isWide, spotlightRect, currentAction } = useDirector();
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [notification, setNotification] = useState(null);
  const [position, setPosition] = useState('tr'); // tr, tl, br, bl
  const scrollRef = useRef();

  useEffect(() => {
    if (currentAction?.notify) {
        setNotification(currentAction.notify);
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [currentAction]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Dynamic Positioning Logic
  useEffect(() => {
    if (!spotlightRect || isWide) return;

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const targetCenterX = spotlightRect.left + spotlightRect.width / 2;
    const targetCenterY = spotlightRect.top + spotlightRect.height / 2;

    // Check which quadrant the spotlight is in and move to an alternative
    if (targetCenterX > screenWidth / 2 && targetCenterY < screenHeight / 2) {
       // Spotlight in Top-Right -> Move to Bottom-Right
       setPosition('br');
    } else if (targetCenterX > screenWidth / 2 && targetCenterY >= screenHeight / 2) {
       // Spotlight in Bottom-Right -> Move to Bottom-Left
       setPosition('bl');
    } else if (targetCenterX <= screenWidth / 2 && targetCenterY >= screenHeight / 2) {
       // Spotlight in Bottom-Left -> Move to Top-Left
       setPosition('tl');
    } else {
       // Spotlight in Top-Left -> Move to Top-Right
       setPosition('tr');
    }
  }, [spotlightRect, isWide]);

  if (!isActive) {
    return (
      <div className="fixed bottom-6 left-6 z-[10001]">
        <Button 
          onClick={startPresentation}
          className="rounded-full h-16 w-16 bg-brand shadow-2xl hover:scale-110 transition-transform flex items-center justify-center p-0 border-4 border-white"
        >
          <img src="/logo.png" alt="Linkler" className="w-10 h-10 object-contain" />
        </Button>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    processMessage(input);
    setInput("");
  };

  const wideStyles = "fixed inset-x-4 top-1/4 bottom-1/4 lg:inset-x-auto lg:right-12 lg:top-24 lg:w-[400px] lg:h-[600px] rounded-[3rem]";

  // Pinned to Top Right
  const getPinnedPosition = () => {
     switch(position) {
        case 'tr': return 'top-6 right-6 lg:right-12';
        case 'tl': return 'top-6 left-6 lg:left-24';
        case 'br': return 'bottom-6 right-6 lg:right-12';
        case 'bl': return 'bottom-6 left-6 lg:left-24';
        default: return 'top-6 right-6 lg:right-12';
     }
  };

  const pinnedStyles = `fixed ${getPinnedPosition()} w-80 h-[450px] rounded-3xl`;

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10002] animate-in slide-in-from-top-10 duration-500">
           <div className="bg-white border-4 border-success px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center text-white">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-success">System Alert</p>
                <p className="text-sm font-bold text-ui-text-main">{notification}</p>
              </div>
           </div>
        </div>
      )}

      <div 
        className={`
          bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-2 border-brand/10 transition-all duration-700 z-[10001] flex flex-col
          ${isWide ? wideStyles : pinnedStyles}
          ${isMinimized && !isWide ? 'h-14 overflow-hidden' : ''}
        `}
      >
        {/* Header */}
        <div 
          className="p-4 border-b border-brand/5 flex items-center justify-between cursor-pointer"
          onClick={() => !isWide && setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-brand/20 bg-brand-light">
              <AvatarImage src="/logo.png" alt="Linkler" />
              <AvatarFallback>L</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-brand leading-none">Linkler</h3>
              <p className="text-[10px] font-bold text-success uppercase mt-1 tracking-tighter">Online</p>
            </div>
          </div>
          {!isWide && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-brand/30">
                 {isMinimized ? '↑' : '↓'}
              </Button>
          )}
        </div>

        {(!isMinimized || isWide) && (
          <>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gradient-to-b from-brand-light/5 to-transparent">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex flex-col ${msg.sender === 'linkler' ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`
                      p-4 rounded-[1.5rem] max-w-[85%] text-sm font-bold shadow-sm border leading-relaxed
                      ${msg.sender === 'linkler' 
                          ? 'bg-white text-ui-text-main rounded-bl-none border-brand/10' 
                          : 'bg-brand text-white rounded-br-none border-transparent'}
                    `}>
                      {msg.text}
                    </div>
                    <p className="text-[9px] mt-1.5 font-black text-ui-muted uppercase tracking-[0.2em] ml-1">
                      {msg.sender === 'linkler' ? 'Linkler' : 'Me'}
                    </p>
                 </div>
               ))}

               {isTyping && (
                 <div className="flex flex-col items-start animate-in fade-in duration-300">
                    <div className="bg-white border border-brand/10 p-4 rounded-[1.5rem] rounded-bl-none shadow-sm flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-brand/40 animate-bounce [animation-delay:0.4s]" />
                    </div>
                 </div>
               )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-6 bg-ui-bg-alt/30 border-t border-brand/10 rounded-b-[inherit]">
               <div className="relative group">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="rounded-full bg-white border-2 border-brand/10 pr-14 focus:border-brand h-14 text-base font-bold shadow-inner transition-all group-focus-within:border-brand/40"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="absolute right-2 top-2 h-10 w-10 rounded-full bg-brand hover:bg-brand-hover shadow-xl transition-all active:scale-90"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                     </svg>
                  </Button>
               </div>
               <p className="text-center text-[9px] font-black uppercase tracking-widest text-ui-muted mt-4 opacity-50">Secure Conversation</p>
            </form>
          </>
        )}
      </div>
    </>
  );
};

export default DirectorBot;
