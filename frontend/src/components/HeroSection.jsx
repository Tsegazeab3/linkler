import React from 'react';

function HeroSection() {
  return (
    <main>
      <div className="flex justify-center gap-10vw mx-auto items-center h-70vh"> {/* gap-10vw is custom */}
        <div className="flex flex-col justify-center gap-20px w-27vw h-20vw text-center bg-orange-200 rounded-bl-none rounded-br-none rounded-tl-none rounded-tr-none p-30px transform rotate-[-1deg] items-center"> {/* custom gap, w, h, p */}
          <h2 className="bg-orange-200 transform rotate-1 text-xl font-bold">A place To find Travel companions</h2>
          <p className="bg-orange-200 transform rotate-1 max-h-70% max-w-80% overflow-hidden text-base">
            If you love travelling Linkler is made for you. find people who want to go to the same places you want to go and travel with them. Save money, explore, get out of your comfort zone and most of all make memories.
          </p>
        </div>
        <div className="w-40vw"> {/* custom w */}
          <img src="/static/assets/travellers-pic-1.png" alt="travellers hiking" className="w-full" />
        </div>
      </div>
    </main>
  );
}

export default HeroSection;
