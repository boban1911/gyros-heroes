import React, { useState, useEffect } from 'react';
import { initializeAnalytics } from '../utils/analytics';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('gyrosHeroes_cookiesAccepted');
    if (!hasAccepted) {
      setShouldRender(true);
      // Wait a moment before animating in for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Initialize analytics immediately if previously accepted
      initializeAnalytics();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gyrosHeroes_cookiesAccepted', 'true');
    initializeAnalytics();
    setIsVisible(false);
    // Unmount completely after transition
    setTimeout(() => {
      setShouldRender(false);
    }, 500);
  };

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 flex justify-center transform transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-hero-blue-dark/95 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-[1200px]">
        <div className="text-white font-montserrat flex-1 text-center md:text-left">
          <h3 className="font-bold text-lg md:text-xl text-hero-yellow mb-2 uppercase tracking-wide">
            Podešavanje kolačića & Privatnost
          </h3>
          <p className="text-sm md:text-base opacity-90 leading-relaxed max-w-3xl">
            Naša web platforma koristi tehničke kolačiće i integracije trećih lica neophodne za funkcionisanje sajta. Nastavkom pregleda dajete saglasnost za njihovu upotrebu u cilju pružanja stabilnog i optimalnog korisničkog iskustva.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center shrink-0 gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openCookiePolicy'))}
            className="bg-white/10 text-white font-montserrat font-bold py-3 px-6 md:py-4 md:px-8 rounded-full border border-white/20 hover:bg-white/20 transition-colors text-sm md:text-base uppercase tracking-wider hover:scale-105 transform duration-300 shadow-sm whitespace-nowrap"
          >
            Saznaj Više
          </button>
          <button 
            onClick={handleAccept}
            className="bg-hero-yellow text-hero-blue-dark font-montserrat font-bold py-3 px-8 md:py-4 md:px-10 rounded-full hover:bg-white transition-colors text-sm md:text-base uppercase tracking-widest hover:scale-105 transform duration-300 shadow-md"
          >
            Slažem Se
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
