import React, { useState } from 'react';

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="flex justify-between px-5vw items-center h-20vh bg-transparent"> {/* Added bg-transparent for now, will apply real color from CSS later */}
      <h1 id="title" className="text-5xl text-pink-300 drop-shadow-2xl italic font-cursive">Linkler</h1>
      
      {/* Desktop Nav */}
      <nav id="desktop-nav" className="hidden lg:flex">
        <ul className="flex items-center gap-25px"> {/* gap-25px is custom, will need to define in tailwind.config.js or use px */}
          <li className="btn-container">
            <button className="bg-yellow-300 px-30px rounded-2xl font-bold h-42px">Support</button>
          </li>
          <li className="btn-container">
            <button className="bg-yellow-300 px-30px rounded-2xl font-bold h-42px">Download Linkler</button>
          </li>
          <li className="btn-container">
            <button className="bg-yellow-300 px-30px rounded-2xl font-bold h-42px">About</button>
          </li>
          <li className="btn-container">
            <button className="bg-yellow-300 px-30px rounded-2xl font-bold h-42px">Contribute</button>
          </li>
          <li id="signup-login" className="flex flex-col gap-5px justify-center items-center relative">
            <div className="btn-container">
              <button className="bg-white w-150px">Sign up</button>
              <img id="sign-up-in-1" src="/static/assets/sign-up-in.png" alt="sign in and sign up arrow" className="absolute h-20px w-20px right-5px bg-white top-11px" />
            </div>
            <div className="btn-container">
              <button className="bg-white w-150px">Log in</button>
              <img id="sign-up-in-2" src="/static/assets/sign-up-in.png" alt="sign in and sign up arrow" className="absolute h-20px w-20px right-5px bg-white top-58px" />
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
          <div className={`menu-links flex-col gap-10px items-center w-200px absolute top-100px right-45px overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-400px p-2.5 rounded-3xl' : 'max-h-0'}`}> {/* p-2.5 and rounded-3xl are custom, will need to define in tailwind.config.js or use px */}
            <li className="btn-container">
              <button>Support</button>
            </li>
            <li className="btn-container">
              <button>Download Linkler</button>
            </li>
            <li className="btn-container">
              <button>About</button>
            </li>
            <li className="btn-container">
              <button>Contribute</button>
            </li>
            <li id="signup-login" className="flex flex-col gap-5px justify-center items-center relative">
              <div className="btn-container">
                <button>Sign up</button>
                <img id="sign-up-in-1" src="/static/assets/sign-up-in.png" alt="sign in and sign up arrow" className="absolute h-20px w-20px right-5px bg-white top-11px" />
              </div>
              <div className="btn-container">
                <button>Log in</button>
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
