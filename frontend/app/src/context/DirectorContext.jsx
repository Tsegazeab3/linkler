import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const script = [
  {
    id: 'step-0',
    trigger: null,
    linkler: "Are you ready to explore?",
    nextUser: "know where",
    action: { type: 'spotlight', target: 'main-feed', zoom: false }
  },
  {
    id: 'step-1',
    trigger: "know where",
    linkler: "I got you. Just press the home button.",
    nextUser: "(Press the Home button)",
    action: { type: 'spotlight', target: 'walkthrough-home', zoom: true }
  },
  {
    id: 'step-2',
    trigger: "action:home-clicked",
    linkler: "Here is your feed. You can explore different places and see what others are up to.",
    nextUser: "(Like a post about a country)",
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
    linkler: "I got you. Just press the compass button on this post.",
    nextUser: "(Press the Compass button on the post)",
    action: { type: 'spotlight', target: 'post-search-trips', zoom: true }
  },
  {
    id: 'step-5',
    trigger: "action:trips-opened",
    linkler: "Plenty of travelers! Look at the seats available on these trips.",
    nextUser: null, 
    autoNext: 3500,
    action: { type: 'spotlight', target: 'trip-seats-left', zoom: true }
  },
  {
    id: 'step-5-b',
    trigger: "auto",
    linkler: "You can also post your own trip by pressing this button.",
    nextUser: null,
    autoNext: 3500,
    action: { type: 'spotlight', target: 'walkthrough-create-trip', zoom: true }
  },
  {
    id: 'step-6',
    trigger: "auto",
    linkler: "If you find what you like, just press Connect to reach out and request to join them.",
    nextUser: "(Press the Connect button on a trip)",
    action: { type: 'spotlight', target: 'trip-connect', zoom: true }
  },
  {
    id: 'step-7',
    trigger: "action:connect-requested",
    linkler: "Perfect! Once you send 'Connect', the owner will see your request. Once they click 'Accept', you're in!",
    nextUser: "dubai",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-8',
    trigger: "dubai",
    linkler: "Don't worry about it I got you. You can find essential services right here.",
    nextUser: "(Press the Essentials button)",
    action: { type: 'spotlight', target: 'walkthrough-essentials', zoom: true }
  },
  {
    id: 'step-9',
    trigger: "action:essentials-opened",
    linkler: "These are the filters. Whether you need transportation, housing, or local support, we have you covered.",
    nextUser: null,
    autoNext: 4000,
    action: { type: 'spotlight', target: 'walkthrough-essentials-categories', zoom: true }
  },
  {
    id: 'step-9-b',
    trigger: "auto",
    linkler: "If you're looking for something specific, you can also use our search bar here.",
    nextUser: null,
    autoNext: 4000,
    action: { type: 'spotlight', target: 'essentials-search-area', zoom: true }
  },
  {
    id: 'step-9-c',
    trigger: "auto",
    linkler: "Local experts can also offer their services by pressing this button. Now, what else is on your mind?",
    nextUser: "doing there",
    action: { type: 'spotlight', target: 'walkthrough-create-service', zoom: true }
  },
  {
    id: 'step-11',
    trigger: "doing there",
    linkler: "Matter of fact I do. You can find incredible local guides here to show you the way.",
    nextUser: "(Press the Experiences button)",
    action: { type: 'spotlight', target: 'walkthrough-experiences', zoom: true }
  },
  {
    id: 'step-12',
    trigger: "action:experiences-opened",
    linkler: "Scroll through them while I talk with my other guy.",
    nextUser: "ripped off",
    action: { type: 'spotlight', target: null, zoom: false }
  },
  {
    id: 'step-13',
    trigger: "ripped off",
    linkler: "No need to worry. We curate the best local deals with verified pricing just for you.",
    nextUser: "(Press the Deals button)",
    action: { type: 'spotlight', target: 'walkthrough-deals', zoom: true }
  },
  {
    id: 'step-14',
    trigger: "action:deals-opened",
    linkler: "Explore these exclusive offers and save on your journey! You can also create your own group here.",
    nextUser: "(Press the Create Group button)",
    action: { type: 'spotlight', target: 'walkthrough-create-group', zoom: true }
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

  const startPresentation = useCallback(() => {
    console.log("Presentation Starting...");
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

    console.log(`Processing Message: "${text}" | Current Step: ${stepIndex}`);

    if (text === 'INTERNAL_NEXT') {
       const nextIndex = stepIndex + 1;
       if (nextIndex < script.length) {
         const nextStep = script[nextIndex];
         setStepIndex(nextIndex);
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

    setMessages(prev => [...prev, { sender: 'person', text, timestamp: new Date() }]);
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
         }, 2000);
       }
    }
  }, [isActive, stepIndex, isWide]);

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
