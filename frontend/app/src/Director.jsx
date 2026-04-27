import React from 'react';
import { DirectorProvider } from './context/DirectorContext';
import DirectorBot from './components/DirectorBot';
import Walkthrough from './components/Walkthrough';

const Director = ({ children }) => {
  return (
    <DirectorProvider>
      {children}
      <Walkthrough />
      <DirectorBot />
    </DirectorProvider>
  );
};

export default Director;
