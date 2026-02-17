import React from 'react';
import Left from './Left';
import Right from './Right';
import UP from './Up';

const ActionButtons = () => {
  return (
    <div className="fixed bottom-0 left-1/2 translate-x-1/2 mb-4 flex items-center justify-center space-x-4">
      <Left className="h-20 w-20 rounded-full " />
      <button className="p-2 rounded-full shadow-lg">
        <UP className="  h-20 w-20" />
      </button>
      <button className="p-2 rounded-full shadow-lg">
        <Right className="h-12 w-12" />
      </button>
    </div>
  );
};

export default ActionButtons;
