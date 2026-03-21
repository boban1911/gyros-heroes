import React from 'react';
import desktopImg from '../assets/pozivnica-desktop.png';
import mobileImg from '../assets/pozivnica-mobile.png';

const Pozivnica: React.FC = () => {
  return (
    <div className="w-full min-h-[100dvh] bg-hero-blue flex flex-col justify-start md:justify-center items-center">
      {/* Desktop Platform (Hidden on mobile) */}
      <div className="hidden md:block relative w-full max-w-[1240px]">
        <img 
          src={desktopImg} 
          alt="Pozivamo Vas na Otvaranje" 
          className="w-full h-auto object-contain"
        />
        {/* Invisible Clickable Hitbox for Desktop Button */}
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSeBhiMoLRDNxE-9jz00h2XfT--xRAW9oq4ypQSvMxRW2LIP9Q/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute z-10 cursor-pointer rounded-full transition-colors duration-200 hover:bg-[rgba(255,255,255,0.12)]"
          style={{ top: '75.26%', left: '47.24%', width: '18.23%', height: '3.08%' }}
          title="Potvrda Dolaska"
          aria-label="Potvrdi dolazak na otvaranje novog Gyros-a u gradu"
        />
      </div>
      
      {/* Mobile Platform (Hidden on desktop) */}
      <div className="block md:hidden relative w-full">
        <img 
          src={mobileImg} 
          alt="Pozivamo Vas na Otvaranje" 
          className="w-full h-auto object-contain"
        />
        {/* Invisible Clickable Hitbox for Mobile Button */}
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSeBhiMoLRDNxE-9jz00h2XfT--xRAW9oq4ypQSvMxRW2LIP9Q/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute z-10 cursor-pointer rounded-full transition-colors duration-200 hover:bg-[rgba(255,255,255,0.12)]"
          style={{ top: '83.01%', left: '18.91%', width: '62.69%', height: '2.19%' }}
          title="Potvrda Dolaska"
          aria-label="Potvrdi dolazak na otvaranje novog Gyros-a u gradu"
        />
      </div>
    </div>
  );
};

export default Pozivnica;
