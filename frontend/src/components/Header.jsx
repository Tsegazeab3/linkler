import { useState, useEffect } from 'react';
import RightArrowIcon from './RightArrowIcon.jsx';
import HomeIcon from './HomeIcon.jsx';
import useTypewriter from '../hooks/useTypewriter.js';
import { smoothScrollTo } from '../utils/smoothScroll.js';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
    <header className="relative z-50 grid grid-cols-[auto_1fr] lg:grid-cols-[1fr_5fr_2fr] gap-2 sm:gap-8 px-5vw items-center py-4 sm:py-8">

      {/* Column 1: Title */}
      <div className="col-span-1">
        <div id="title" className="top-4 left-4 sm:top-8 sm:left-8 text-4xl  text-black drop-shadow-blue font-display italic">
          <div className={`transition-opacity duration-300 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}>
            <span className="bg-linear-to-r from-blue-500 to-purple-500 font-bold bg-clip-text text-transparent">
              Linkler
            </span>
          </div>
          <div
            className={`fixed overflow-clip backdrop-blur-xs rounded-full top-10 left-10 flex items-center gap-2 transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'} cursor-pointer`}
            onClick={() => smoothScrollTo(0, 500)}
          >
            <span className=''>{homeText}</span>
            <HomeIcon className={`  w-10 h-10 transition-transform duration-500 ${isScrolled ? 'translate-x-0' : 'translate-x-8'}`} />
          </div>
        </div>
      </div>

      {/* Column 2 (lg): Main Nav */}
      <nav id="desktop-nav" className="hidden lg:flex justify-center col-span-1">
        <ul className="flex items-center gap-2 lg:gap-4">
          {['Web', 'Support', 'Download', 'About', 'Contribute'].map((item) => (
            <li key={item} className="btn-container">
              <button className="flex justify-center gap-1 bg-[#ffda00] sm:gap-2 bg-px-3 py-1.5 sm:px-6 sm:py-2 rounded-full border-solid border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-[#e6c300] hover:-translate-x-1 hover:-translate-y-1">
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Column 2 (sm) / Column 3 (lg): Right side */}
      <div className="col-start-2 md:col-start-3 flex  justify-end items-center gap-4">
        <div id="signup-login" className="hidden min-[420px]:flex gap-2 items-center">
          <button className="flex items-center justify-center gap-2 bg-white px-3 md:px-6 py-2 rounded-full border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-gray-100 hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Sign up</span>
            <RightArrowIcon className="h-5 w-5" />
          </button>
          <button className="flex items-center justify-center gap-2 bg-white px-6 py-2 rounded-full border-2 transition-all duration-300 ease-in-out hover:shadow-xl hover:bg-gray-100 hover:-translate-x-1 hover:-translate-y-1">
            <span className="font-bold text-sm whitespace-nowrap">Log in</span>
            <RightArrowIcon className="h-5 w-5" />
          </button>
        </div>

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

              {/* Mobile Only: Sign up / Log in (Hidden above 420px) */}
              <div className="flex flex-col gap-4 min-[420px]:hidden w-64 text-center pb-4 border-b border-gray-200">
                <button className="text-xl font-bold" onClick={toggleMenu}>Sign up</button>
                <button className="text-xl font-bold" onClick={toggleMenu}>Log in</button>
              </div>

              {['Web', 'Support', 'Download', 'About', 'Contribute'].map((item) => (
                <button key={item} className="text-xl font-bold" onClick={toggleMenu}>{item}</button>
              ))}
            </div>

          </div>
        </nav>

      </div>
    </header>
  );
}

export default Header;
