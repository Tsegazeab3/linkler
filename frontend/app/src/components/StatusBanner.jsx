import React, { useEffect, useState } from 'react';

const StatusBanner = ({ message, type = 'error', onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className={`fixed top-10 left-0 right-0 z-[10000] flex justify-center px-6 transition-all duration-500 ease-out ${show ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}>
      <div 
        className={`w-full max-w-sm backdrop-blur-2xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex items-center p-4 gap-4 ${isError ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}
      >
        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-white shadow-lg ${isError ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
          {isError ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        
        <div className="flex-grow">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${isError ? 'text-red-600' : 'text-emerald-600'}`}>
            {isError ? 'System Error' : 'Success'}
          </h4>
          <p className="text-sm font-bold text-gray-800 leading-tight">
            {message}
          </p>
        </div>

        <button 
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StatusBanner;