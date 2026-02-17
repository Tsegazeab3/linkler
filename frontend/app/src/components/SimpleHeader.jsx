import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useTypewriter from '../hooks/useTypewriter.js';
import HomeIcon from './HomeIcon.jsx';
import RightArrowIcon from './RightArrowIcon.jsx';
import { smoothScrollTo } from '../utils/smoothScroll.js';

function SimpleHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const homeText = useTypewriter(isScrolled ? 'Home' : '', 150);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="relative z-50 flex items-center justify-between px-4 sm:px-8 py-4  flex-wrap">
      {/* Linkler Title */}
      <div className="text-4xl text-black drop-shadow-blue font-display italic relative min-w-0">
        {/* Non-scrolled Linkler */}
        <div className={`transition-opacity duration-300 ${isScrolled ? 'opacity-0 absolute -z-10' : 'opacity-100'}`}>
          <span className="bg-linear-to-r from-blue-500 to-purple-500 font-bold bg-clip-text text-transparent">
            <Link to="/">Linkler</Link>
          </span>
        </div>
        {/* Scrolled Home text (fixed) */}
        {isScrolled && ( // Only render when scrolled
          <div
            className={`fixed overflow-clip backdrop-blur-xs rounded-full top-10 left-10 flex items-center gap-2 transition-opacity duration-300 opacity-100 cursor-pointer`}
            onClick={() => smoothScrollTo(0, 500)}
          >
            <span className=''>{homeText}</span>
            <HomeIcon className={`  w-10 h-10 transition-transform duration-500 ${isScrolled ? 'translate-x-0' : 'translate-x-8'}`} />
          </div>
        )}
      </div>

      {/* Hamburger Icon for Mobile */}
      <nav id="hamburger-nav" className="md:hidden">
        <div className="hamburger-menu">
          <div
            className="hamburger-icon flex flex-col justify-between h-[24px] w-[30px] cursor-pointer relative z-30"
            onClick={toggleMenu}
          >
            <span className={`w-full h-[2px] bg-black transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[11px]' : ''}`}></span>
            <span className={`w-full h-[2px] bg-black transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-[2px] bg-black transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[11px]' : ''}`}></span>
          </div>

          <div className={`fixed inset-0 z-20 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Linkler Title for Mobile Menu */}
            <h1 className="text-5xl font-bold text-blue-600 mb-8">Linkler</h1>
            {/* Mobile Navigation Buttons */}
            <div className="flex flex-col gap-4 text-center pb-4 border-b border-gray-200">
              <Link to="/register" className="text-xl font-bold" onClick={toggleMenu}>Register as Traveller</Link>
              <Link to="/register" className="text-xl font-bold" onClick={toggleMenu}>Register as Guide</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex flex-nowrap gap-4 mt-8 sm:mt-0 min-w-0">
        <Link to="/register">
          <button className="flex items-center justify-center gap-2 bg-white px-3 md:px-6 py-2 rounded-full border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-gray-200 hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Register as Traveller</span>
            <RightArrowIcon className="h-5 w-5" />
          </button>
        </Link>
        <Link to="/register">
          <button className="flex items-center justify-center gap-2 bg-white px-3 md:px-6 py-2 rounded-full border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-gray-200 hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Register as Guide</span>
            <RightArrowIcon className="h-5 w-5" />
          </button>
        </Link>
      </div>
    </header>
  );
}

export default SimpleHeader;
