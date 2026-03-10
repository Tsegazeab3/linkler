import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useTypewriter from '../hooks/useTypewriter.js';
import RightArrowIcon from './RightArrowIcon.jsx';
import { smoothScrollTo } from '../utils/smoothScroll.js';

function SimpleHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const homeText = useTypewriter(isScrolled ? 'Home' : '', 150);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-4 flex-wrap">
      {/* Linkler Title */}
      <div className="text-4xl text-black text-shadow-blue font-display italic relative min-w-0">
        <div className={`transition-opacity duration-300 ${isScrolled ? 'opacity-0 absolute -z-10' : 'opacity-100'}`}>
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 font-bold bg-clip-text text-transparent">
            <Link to="/">Linkler</Link>
          </span>
        </div>
        {isScrolled && (
          <div
            className="fixed overflow-clip backdrop-blur-xs rounded-full top-10 left-10 flex items-center gap-2 transition-opacity duration-300 opacity-100 cursor-pointer"
            onClick={() => smoothScrollTo(0, 500)}
          >
            <span className="font-bold text-[#3b82f6] text-2xl">{homeText}</span>
          </div>
        )}
      </div>

      <nav id="hamburger-nav" className="md:hidden">
        <div className={`hamburger-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div className="relative z-30 flex flex-col gap-1.5 cursor-pointer">
            <span className={`block w-8 h-1 bg-black rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`block w-8 h-1 bg-black rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-8 h-1 bg-black rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
          </div>

          <div className={`fixed inset-0 z-20 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <h1 className="text-5xl font-bold text-blue-600 mb-8">Linkler</h1>
            <div className="flex flex-col gap-4 text-center pb-4 border-b border-gray-200">
              <Link to="/signin" className="text-xl font-bold" onClick={toggleMenu}>Sign in</Link>
              <Link to="/signup" className="text-xl font-bold" onClick={toggleMenu}>Sign up</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="hidden md:flex flex-nowrap gap-4 mt-8 sm:mt-0 min-w-0">
        <Link to="/signin">
          <button className="flex items-center justify-center gap-2 bg-white px-3 md:px-6 py-2 rounded-full border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-gray-200 hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Sign In</span>
            <RightArrowIcon className="h-5 w-5" />
          </button>
        </Link>
        <Link to="/signup">
          <button className="flex items-center justify-center gap-2 bg-[#3b82f6] text-white px-3 md:px-6 py-2 rounded-full border-2 border-[#3b82f6] transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-blue-600 hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Sign Up</span>
            <RightArrowIcon className="h-5 w-5 text-white" />
          </button>
        </Link>
      </div>
    </header>
  );
}

export default SimpleHeader;
