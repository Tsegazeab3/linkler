import React from 'react';
import Left from './Left';
import Right from './Right';
import UP from './Up';

const ActionButtons = () => {
  return (
    <div className="flex items-center justify-center space-x-4 my-4">
      <div className="h-20 w-20 overflow-hidden rounded-full shadow-lg transform transition-transform duration-200 hover:scale-110">
        <Left className="h-full w-full" />
      </div>
      <div className="h-20 w-20 rounded-full shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-110">
        <UP className="h-full w-full" />
      </div>
      <div className="h-20 w-20 rounded-full shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-110">
        <Right className="h-full w-full" />
      </div>
    </div>
  );
};

export default ActionButtons;
