import React, { useState, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';

const steps = [
  {
    targetId: null, // Centered welcome
    title: 'Welcome to Linkler!',
    description: 'The social platform for travelers and local guides. Let\'s show you around.',
    image: '/logo.png'
  },
  {
    targetId: 'walkthrough-home',
    mobileTargetId: 'walkthrough-home-mobile',
    title: 'Your Feed',
    description: 'See the latest posts from travelers and guides around the world.',
    position: 'right',
    mobilePosition: 'top'
  },
  {
    targetId: 'walkthrough-search',
    mobileTargetId: 'walkthrough-search-mobile',
    title: 'Discover',
    description: 'Find fellow travelers, groups, and exciting experiences.',
    position: 'right',
    mobilePosition: 'bottom'
  },
  {
    targetId: 'walkthrough-plus',
    mobileTargetId: 'walkthrough-plus-mobile',
    title: 'Create Content',
    description: 'Share your own travel stories or create new trips and groups.',
    position: 'left',
    mobilePosition: 'top'
  },
  {
    targetId: 'walkthrough-messages',
    mobileTargetId: 'walkthrough-messages-mobile',
    title: 'Stay Connected',
    description: 'Chat with your friends and travel partners in real-time.',
    position: 'right',
    mobilePosition: 'top'
  }
];

const Walkthrough = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const step = steps[currentStep];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useLayoutEffect(() => {
    const updateRect = () => {
      const id = isMobile ? (step.mobileTargetId || step.targetId) : step.targetId;
      if (!id) {
        setTargetRect(null);
        return;
      }
      const el = document.getElementById(id);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
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
  }, [currentStep, step.targetId, step.mobileTargetId, isMobile]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Tooltip position calculation
  const tooltipStyle = {
    position: 'fixed',
    zIndex: 10001,
  };

  if (!targetRect) {
    // Center of screen
    tooltipStyle.left = '50%';
    tooltipStyle.top = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  } else {
    const pos = isMobile ? step.mobilePosition : step.position;

    if (pos === 'right') {
      tooltipStyle.left = targetRect.right + 20;
      tooltipStyle.top = Math.max(20, Math.min(window.innerHeight - 200, targetRect.top));
    } else if (pos === 'left') {
      tooltipStyle.right = window.innerWidth - targetRect.left + 20;
      tooltipStyle.top = Math.max(20, Math.min(window.innerHeight - 200, targetRect.top));
    } else if (pos === 'bottom') {
      tooltipStyle.left = Math.max(20, Math.min(window.innerWidth - 300, targetRect.left));
      tooltipStyle.top = targetRect.bottom + 20;
    } else if (pos === 'top') {
      tooltipStyle.left = Math.max(20, Math.min(window.innerWidth - 300, targetRect.left));
      tooltipStyle.bottom = (window.innerHeight - targetRect.top) + 20;
    }
    
    // Safety check for off-screen
    if (parseInt(tooltipStyle.top) > window.innerHeight - 100) {
        tooltipStyle.top = window.innerHeight - 250;
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 pointer-events-auto transition-all duration-300"
        style={targetRect ? {
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${targetRect.left - 5}px 100%, 
            ${targetRect.left - 5}px ${targetRect.top - 5}px, 
            ${targetRect.right + 5}px ${targetRect.top - 5}px, 
            ${targetRect.right + 5}px ${targetRect.bottom + 5}px, 
            ${targetRect.left - 5}px ${targetRect.bottom + 5}px, 
            ${targetRect.left - 5}px 100%, 
            100% 100%, 100% 0%
          )`
        } : {}}
      />

      {/* Tooltip */}
      <div 
        className="bg-ui-white p-6 rounded-2xl shadow-2xl w-[280px] lg:w-80 pointer-events-auto animate-in fade-in zoom-in duration-300 border border-ui-border"
        style={tooltipStyle}
      >
        {step.image && (
          <div className="mb-4 flex justify-center">
            <img src={step.image} alt="Mascot" className="w-24 h-24 object-contain animate-bounce" />
          </div>
        )}
        <div className="mb-4">
          <h4 className="text-xl font-bold text-brand mb-1">{step.title}</h4>
          <p className="text-ui-text-secondary text-sm leading-relaxed">{step.description}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={handleSkip}
            className="text-xs text-ui-muted hover:text-ui-text-main font-bold uppercase tracking-wider transition-colors"
          >
            Skip
          </button>
          <Button onClick={handleNext} size="sm" className="px-6 font-bold">
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
        
        <div className="mt-6 flex gap-1.5">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i === currentStep ? 'bg-brand scale-x-110' : 'bg-ui-bg-alt'}`}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Walkthrough;
