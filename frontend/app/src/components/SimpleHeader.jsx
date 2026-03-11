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
      <div className="text-4xl text-ui-text-main text-shadow-blue font-display italic relative min-w-0">
        <div className={`transition-opacity duration-300 ${isScrolled ? 'opacity-0 absolute -z-10' : 'opacity-100'}`}>
          <span className="bg-gradient-to-r from-brand to-accent-purple font-bold bg-clip-text text-transparent">
            <Link to="/">Linkler</Link>
          </span>
        </div>
        {isScrolled && (
          <div
            className="fixed overflow-clip backdrop-blur-xs rounded-full top-10 left-10 flex items-center gap-2 transition-opacity duration-300 opacity-100 cursor-pointer"
            onClick={() => smoothScrollTo(0, 500)}
          >
            <span className="font-bold text-brand text-2xl">{homeText}</span>
          </div>
        )}
      </div>

      {/* Hamburger Icon for Mobile */}
      <nav id="hamburger-nav" className="md:hidden">
        <div className={`hamburger-menu ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
          <div className="relative z-30 flex flex-col gap-1.5 cursor-pointer">
            <span className={`block w-8 h-1 bg-ui-text-main rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`}></span>
            <span className={`block w-8 h-1 bg-ui-text-main rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-8 h-1 bg-ui-text-main rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`}></span>
          </div>

          <div className={`fixed inset-0 z-20 bg-ui-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <h1 className="text-5xl font-bold text-brand mb-8">Linkler</h1>
            <div className="flex flex-col gap-4 text-center pb-4 border-b border-ui-border">
              <Link to="/signin" className="text-xl font-bold" onClick={toggleMenu}>Sign In</Link>
              <Link to="/signup" className="text-xl font-bold" onClick={toggleMenu}>Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex flex-nowrap gap-4 mt-8 sm:mt-0 min-w-0">
        <Link to="/signin">
          <button className="flex items-center justify-center gap-2 bg-ui-white px-3 md:px-6 py-2 rounded-full border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-ui-bg-alt hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Sign In</span>
            <RightArrowIcon className="h-5 w-5" />
          </button>
        </Link>
        <Link to="/signup">
          <button className="flex items-center justify-center gap-2 bg-brand text-white px-3 md:px-6 py-2 rounded-full border-2 border-brand transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-brand-hover hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Sign Up</span>
            <RightArrowIcon className="h-5 w-5 text-white" />
          </button>
        </Link>
      </div>
    </header>
  );
}

export default SimpleHeader;
