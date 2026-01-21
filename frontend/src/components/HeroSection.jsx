import React from 'react';

function HeroSection() {
  return (
    <main>
      <div className="flex justify-center gap-10vw mx-auto items-center h-70vh flex-col lg:flex-row"> {/* Added responsive flex-direction */}
        <div className="flex flex-col justify-center gap-20px w-27vw h-20vw text-center bg-linkler-orange-light rounded-0px-80px-0px-80px p-30px -rotate-1 items-center">
          <h2 className="bg-linkler-orange-light rotate-1">A place To find Travel companions</h2>
          <p className="bg-linkler-orange-light rotate-1 max-h-70% max-w-80% overflow-hidden text-15px">
            If you love travelling Linkler is made for you. find people who want to go to the same places you want to go and travel with them. Save money, explore, get out of your comfort zone and most of all make memories.
          </p>
        </div>
        <div className="w-40vw rounded-0px-80px-0px-80px overflow-hidden"> {/* Added custom border-radius and overflow-hidden */}
          <img src="/assets/travellers-pic-1.png" alt="travellers hiking" className="w-full" />
        </div>      </div>
    </main>
  );
}

export default HeroSection;
