import React, { useState } from 'react';

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="flex justify-between px-5vw items-center h-20vh">
      <h1 id="title" className="text-3rem text-linkler-pink drop-shadow-blue font-display italic">Linkler</h1>
      
      {/* Desktop Nav */}
      <nav id="desktop-nav" className="hidden lg:flex">
        <ul className="flex items-center gap-25px">
          <li className="btn-container">
            <button className="bg-linkler-yellow px-30px rounded-20px font-bold h-42px text-15px">Support</button>
          </li>
          <li className="btn-container">
            <button className="bg-linkler-yellow px-30px rounded-20px font-bold h-42px text-15px">Download Linkler</button>
          </li>
          <li className="btn-container">
            <button className="bg-linkler-yellow px-30px rounded-20px font-bold h-42px text-15px">About</button>
          </li>
          <li className="btn-container">
            <button className="bg-linkler-yellow px-30px rounded-20px font-bold h-42px text-15px">Contribute</button>
          </li>
          <li id="signup-login" className="flex flex-col gap-5px justify-center items-center relative">
            <div className="btn-container">
              <button className="bg-white w-150px text-15px">Sign up</button>
              <img id="sign-up-in-1" src="/assets/sign-up-in.png" alt="sign in and sign up arrow" className="absolute h-20px w-20px right-5px bg-white top-11px" />
            </div>
            <div className="btn-container">
              <button className="bg-white w-150px text-15px">Log in</button>
              <img id="sign-up-in-2" src="/assets/sign-up-in.png" alt="sign in and sign up arrow" className="absolute h-20px w-20px right-5px bg-white top-58px" />
            </div>
          </li>
        </ul>
      </nav>

      {/* Hamburger Nav */}
      <nav id="hamburger-nav" className="lg:hidden flex">
        <div className="hamburger-menu">
          <div className="hamburger-icon flex flex-col justify-between h-24px w-30px cursor-pointer" onClick={toggleMenu}>
            <span className={`w-full h-2px bg-black transition-all duration-300 ${isOpen ? 'rotate-45 translate-x-2.5 translate-y-1.25' : ''}`}></span>
            <span className={`w-full h-2px bg-black transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-2px bg-black transition-all duration-300 ${isOpen ? '-rotate-45 translate-x-2.5 -translate-y-1.25' : ''}`}></span>
          </div>
          <div className={`menu-links flex-col gap-10px items-center w-200px absolute top-100px right-45px overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-400px p-20px rounded-20px' : 'max-h-0'}`}>
            <li className="btn-container">
              <button className="text-15px">Support</button>
            </li>
            <li className="btn-container">
              <button className="text-15px">Download Linkler</button>
            </li>
            <li className="btn-container">
              <button className="text-15px">About</button>
            </li>
            <li className="btn-container">
              <button className="text-15px">Contribute</button>
            </li>
            <li id="signup-login" className="flex flex-col gap-5px justify-center items-center relative">
              <div className="btn-container">
                <button className="text-15px">Sign up</button>
                <img id="sign-up-in-1" src="/static/assets/sign-up-in.png" alt="sign in and sign up arrow" className="absolute h-20px w-20px right-5px bg-white top-11px" />
              </div>
              <div className="btn-container">
                <button className="text-15px">Log in</button>
                <img id="sign-up-in-2" src="/static/assets/sign-up-in.png" alt="sign in and sign up arrow" className="absolute h-20px w-20px right-5px bg-white top-58px" />
              </div>
            </li>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
