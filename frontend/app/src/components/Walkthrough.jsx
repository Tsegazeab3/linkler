import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDirector } from '../context/DirectorContext';

const Walkthrough = () => {
  const { isActive, currentAction, setSpotlightRect, messages, isWide, currentStep } = useDirector();
  const [targetRect, setTargetRect] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    const updateRect = () => {
      if (!isActive || !currentAction?.target) {
        setTargetRect(null);
        setSpotlightRect(null);
        return;
      }
      
      let targetId = currentAction.target;
      let el = null;
      if (isMobile) {
          el = document.getElementById(`${targetId}-mobile`);
      }
      if (!el) {
          el = document.getElementById(targetId) || 
               document.querySelector(`[id*="${targetId}"]`) || 
               document.querySelector(`[data-walkthrough="${targetId}"]`);
      }
      
      if (el) {
        const rect = el.getBoundingClientRect();
        if (targetId === 'main-feed') {
           const screenWidth = window.innerWidth;
           const sideNavWidth = isMobile ? 0 : 80;
           setTargetRect({
              left: sideNavWidth + (screenWidth - sideNavWidth) / 4,
              top: 100,
              width: (screenWidth - sideNavWidth) / 2,
              height: window.innerHeight - 200,
              right: sideNavWidth + (screenWidth - sideNavWidth) * 0.75,
              bottom: window.innerHeight - 100
           });
        } else {
           setTargetRect(rect);
        }
        setSpotlightRect(rect);
        if (currentAction.zoom) {
           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetRect(null);
        setSpotlightRect(null);
      }
    };

    const timer = setTimeout(updateRect, 100); 
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
    }, [isActive, currentAction, isMobile, setSpotlightRect]);

  if (!isActive || isWide || !targetRect) return null;

  const centerY = targetRect.top + (targetRect.height / 2);
  const isTargetOnLeft = targetRect.left < 250;
  
  let mascotX, labelX, arrowRotation;
  if (isTargetOnLeft) {
      mascotX = targetRect.right + 20;
      labelX = mascotX + 110;
      arrowRotation = 'rotate-180';
  } else {
      mascotX = targetRect.left - 120;
      labelX = mascotX - 260;
      arrowRotation = 'rotate-0';
  }

  if (mascotX < 10) mascotX = 10;
  if (mascotX > window.innerWidth - 110) mascotX = window.innerWidth - 110;
  if (labelX < 10) labelX = 10;
  if (labelX > window.innerWidth - 310) labelX = window.innerWidth - 310;

  const linklerMessage = currentStep?.linkler || "";

  return createPortal(
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
      {currentAction?.zoom && (
        <div 
          className="absolute z-[9999] rounded-xl transition-all duration-700 pointer-events-none scale-110"
          style={{
            left: targetRect.left - 10,
            top: targetRect.top - 10,
            width: targetRect.width + 20,
            height: targetRect.height + 20,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.7), 0 0 40px var(--color-brand)',
            border: '4px solid var(--color-brand)'
          }}
        />
      )}

      {currentAction?.zoom && (
        <div 
            className={`absolute z-[10002] transition-all duration-700 ${arrowRotation}`}
            style={{
                left: isTargetOnLeft ? targetRect.right + 5 : targetRect.left - 45,
                top: centerY - 20
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand animate-pulse drop-shadow-[0_0_10px_white]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
        </div>
      )}

      <div 
        className="absolute z-[10002] transition-all duration-700 flex items-center"
        style={{
            left: labelX,
            top: centerY - 40,
            width: '300px'
        }}
      >
        <div className="relative bg-white text-ui-text-main p-4 rounded-3xl shadow-2xl border-4 border-brand animate-in fade-in zoom-in duration-500">
           <p className="text-sm font-black italic uppercase tracking-tighter leading-tight">
              {linklerMessage}
           </p>
           <div className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-brand border-b-4 border-r-4 rotate-45 ${isTargetOnLeft ? '-left-3 border-l-4 border-t-4 border-b-0 border-r-0' : '-right-3'}`} />
        </div>
      </div>

      <div 
        className="absolute z-[10001] transition-all duration-1000 ease-in-out"
        style={{
          left: mascotX,
          top: centerY - 50,
          width: '100px',
          height: '100px'
        }}
      >
        <img src="/logo.png" alt="Mascot" className="w-full h-full object-contain filter drop-shadow-[0_0_20px_white] animate-pulse" />
      </div>
    </div>,
    document.body
  );
};

export default Walkthrough;
