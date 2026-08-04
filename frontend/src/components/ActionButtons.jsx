import React from 'react';
import Left from './Left';
import Right from './Right';
import UP from './Up';

const ActionButtons = ({ onNext, onPrevious, onToggleDetails, isDetailsOpen }) => {
  return (
    <div className="flex items-center justify-center space-x-6 my-6">
      <button 
        onClick={onPrevious}
        className="h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full shadow-lg transform transition-all duration-200 hover:scale-110 active:scale-95 bg-ui-white text-ui-text-main border border-ui-border flex items-center justify-center"
      >
        <Left className="h-full w-full" />
      </button>
      
      <button 
        onClick={onToggleDetails}
        className="h-20 w-20 md:h-24 md:w-24 rounded-full shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-110 active:scale-95 bg-brand text-white flex items-center justify-center"
      >
        <div className={`transform transition-transform duration-500 ${isDetailsOpen ? 'rotate-180' : 'rotate-0'}`}>
          <UP className="h-full w-full" />
        </div>
      </button>
      
      <button 
        onClick={onNext}
        className="h-16 w-16 md:h-20 md:w-20 rounded-full shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-110 active:scale-95 bg-ui-white text-ui-text-main border border-ui-border flex items-center justify-center"
      >
        <Right className="h-full w-full" />
      </button>
    </div>
  );
};

export default ActionButtons;
