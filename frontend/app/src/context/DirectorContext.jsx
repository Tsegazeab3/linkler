import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const script = [
  {
    id: 'step-0',
    trigger: null,
    linkler: "Welcome to your profile, Tsegazeab! Ready to start your next big adventure?",
    nextUser: "know where",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-1',
    trigger: "know where",
    linkler: "I've got just the thing. Let's head over to your main feed for some inspiration.",
    nextUser: "(Press the Home button)",
    action: { type: 'spotlight', target: 'walkthrough-home', zoom: true }
  },
  {
    id: 'step-2',
    trigger: "action:home-clicked",
    linkler: "Here is your feed. Dubai? Great choice. It's beautiful this time of year. Take a look around!",
    nextUser: "(Like the Dubai post)",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-3',
    trigger: "action:post-liked",
    linkler: "So you like to go here?",
    nextUser: "alone",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-4',
    trigger: "alone",
    linkler: "I completely understand. Traveling is always better with company. Let's find you some travel partners heading that way.",
    nextUser: "(Press the Compass button on the post)",
    action: { type: 'spotlight', target: 'post-search-trips', zoom: true }
  },
  {
    id: 'step-5',
    trigger: "action:trips-opened",
    linkler: "See? Plenty of people looking for companions. You can see how many spots are still available...",
    nextUser: null, 
    autoNext: 3000,
    action: { type: 'spotlight', target: 'trip-seats-left', zoom: true }
  },
  {
    id: 'step-5-b',
    trigger: "auto",
    linkler: "...and if you have a plan of your own, you can easily host a trip right here.",
    nextUser: null,
    autoNext: 3000,
    action: { type: 'spotlight', target: 'walkthrough-create-trip', zoom: true }
  },
  {
    id: 'step-6',
    trigger: "auto",
    linkler: "Found a group you like? Just hit Connect to send them a request.",
    nextUser: "(Press the Connect button on a trip)",
    action: { type: 'spotlight', target: 'trip-connect', zoom: true }
  },
  {
    id: 'step-7',
    trigger: "action:connect-requested",
    linkler: "Perfect! Your request is sent. Once they accept, you'll be able to chat and plan together. Safety first!",
    nextUser: "dubai",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-8',
    trigger: "dubai",
    linkler: "Dubai is incredible, but it's good to be prepared. Let's look at some essentials like housing and local rules.",
    nextUser: "(Press the Essentials button)",
    action: { type: 'spotlight', target: 'walkthrough-essentials', zoom: true }
  },
  {
    id: 'step-9',
    trigger: "action:essentials-opened",
    linkler: "We've got categories for everything—transport, stays, you name it. Take your pick.",
    nextUser: null,
    autoNext: 3500,
    action: { type: 'spotlight', target: 'walkthrough-essentials-categories', zoom: true }
  },
  {
    id: 'step-9-b',
    trigger: "auto",
    linkler: "And if you need something really specific, our search is always ready to help.",
    nextUser: null,
    autoNext: 3500,
    action: { type: 'spotlight', target: 'essentials-search-area', zoom: true }
  },
  {
    id: 'step-9-c',
    trigger: "auto",
    linkler: "Are you a local expert? You can even list your own professional services here.",
    nextUser: null,
    autoNext: 3500,
    action: { type: 'spotlight', target: 'walkthrough-create-service', zoom: true }
  },
  {
    id: 'step-10',
    trigger: "auto",
    linkler: "So, what's the next step on your journey?",
    nextUser: "doing there",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-11',
    trigger: "doing there",
    linkler: "Actually, we have local guides who can show you the side of the city most tourists never see. Check out Hassan!",
    nextUser: "(Click on Hassan's card)",
    action: { type: 'spotlight', target: 'walkthrough-hassan-card', zoom: true }
  },
  {
    id: 'step-12',
    trigger: "action:hassan-opened", // Wait for Hassan detail click
    linkler: "Hassan is fully Verified by our team. Take a look at his reviews—travelers love his hidden gems tour.",
    nextUser: "(Click Book Now)",
    action: { type: 'spotlight', target: 'walkthrough-hassan-verified', zoom: true }
  },
  {
    id: 'step-13',
    trigger: "action:booking-sent",
    linkler: "Booking request sent! While I go talk to my guy and get that sorted, why don't you check out some deals?",
    nextUser: null,
    autoNext: 4000,
    action: { type: 'redirect', target: '/app/promotions' }
  },
  {
    id: 'step-14',
    trigger: "auto",
    linkler: "There we go! Hassan has accepted your request. Your real Dubai journey is officially on the books.",
    nextUser: "End of Part 1",
    action: { type: 'spotlight', target: null, zoom: false, notify: "Hassan has accepted your request!" }
  }
];

const DirectorContext = createContext();

export const DirectorProvider = ({ children }) => {
  const [stepIndex, setStepIndex] = useState(-1);
  const [messages, setMessages] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isWide, setIsWide] = useState(true);
  const navigate = useNavigate();

  const startPresentation = useCallback(() => {
    setIsActive(true);
    setIsWide(true);
    setStepIndex(0);
    const firstStep = script[0];
    
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{ sender: 'linkler', text: firstStep.linkler, timestamp: new Date() }]);
      setCurrentAction(firstStep.action);
      setIsTyping(false);
    }, 1000);
  }, []);

  const processMessage = useCallback((text) => {
    if (!isActive) return;

    const currentStep = script[stepIndex];
    if (!currentStep) return;

    if (text === 'INTERNAL_NEXT') {
       const nextIndex = stepIndex + 1;
       if (nextIndex < script.length) {
         const nextStep = script[nextIndex];
         setStepIndex(nextIndex);
         
         if (nextStep.action?.type === 'redirect') {
             navigate(nextStep.action.target);
             setTimeout(() => processMessage('INTERNAL_NEXT'), 1000);
             return;
         }

         setIsTyping(true);
         setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'linkler', text: nextStep.linkler, timestamp: new Date() }]);
            setCurrentAction(nextStep.action);
            setIsTyping(false);
         }, 1500);
       }
       return;
    }

    const cleanInput = text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const cleanTrigger = currentStep.nextUser?.toLowerCase().replace(/[()]/g, '').replace(/[^a-z0-9]/g, '').trim() || "TRIGGER_NONE";
    const isNextCmd = text.toLowerCase().trim() === 'next';

    if (cleanInput.includes(cleanTrigger) || isNextCmd) {
        setCurrentAction(null); 
    }

    if (text !== 'INTERNAL_NEXT' && !isNextCmd) {
        setMessages(prev => [...prev, { sender: 'person', text, timestamp: new Date() }]);
    }
    
    if (isWide) setIsWide(false);

    if ((currentStep.nextUser && cleanInput.includes(cleanTrigger)) || isNextCmd) {
       const nextIndex = stepIndex + 1;
       if (nextIndex < script.length) {
         const nextStep = script[nextIndex];
         setStepIndex(nextIndex);
         
         setIsTyping(true);
         setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'linkler', text: nextStep.linkler, timestamp: new Date() }]);
            setCurrentAction(nextStep.action);
            setIsTyping(false);
         }, 1200);
       }
    }
  }, [isActive, stepIndex, isWide, navigate]);

  const triggerAction = useCallback((actionId) => {
    if (!isActive) return;
    const nextStep = script[stepIndex + 1];
    if (nextStep && nextStep.trigger === actionId) {
        setCurrentAction(null);
        processMessage("next"); 
    }
  }, [isActive, stepIndex, processMessage]);

  useEffect(() => {
    if (!isActive || isTyping) return;
    
    const currentStep = script[stepIndex];
    if (currentStep?.autoNext) {
        const timer = setTimeout(() => {
            processMessage('INTERNAL_NEXT');
        }, currentStep.autoNext);
        return () => clearTimeout(timer);
    }
  }, [stepIndex, isActive, isTyping, processMessage]);

  return (
    <DirectorContext.Provider value={{
      isActive,
      startPresentation,
      messages,
      processMessage,
      currentAction,
      triggerAction,
      stepIndex,
      currentStep: script[stepIndex],
      isTyping,
      isWide,
      setIsWide,
      spotlightRect,
      setSpotlightRect
    }}>
      {children}
    </DirectorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDirector = () => useContext(DirectorContext);
