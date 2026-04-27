import React, { createContext, useContext, useState, useCallback } from 'react';
import { script } from '../data/presentationScript';

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

    console.log(`Processing Message: "${text}" | Current Step: ${stepIndex} | Expecting: "${currentStep.nextUser}"`);

    setMessages(prev => [...prev, { sender: 'person', text, timestamp: new Date() }]);
    if (isWide) setIsWide(false);

    // Normalize for matching
    const cleanInput = text.toLowerCase().replace(/['’]/g, "'").trim();
    const cleanTrigger = currentStep.nextUser.toLowerCase().replace(/[()]/g, '').replace(/['’]/g, "'").trim();

    const match = cleanInput.includes(cleanTrigger) || cleanInput === 'next';

    if (match) {
       console.log("MATCH FOUND! Advancing script...");
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
    }
  }, [isActive, stepIndex, isWide]);

  const triggerAction = useCallback((actionId) => {
    if (!isActive) return;
    const nextStep = script[stepIndex + 1];
    console.log(`Action Triggered: "${actionId}" | Awaiting Trigger: "${nextStep?.trigger}"`);
    if (nextStep && nextStep.trigger === actionId) {
        processMessage("next"); 
    }
  }, [isActive, stepIndex, processMessage]);

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
