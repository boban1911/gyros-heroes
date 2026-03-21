import React, { useState, useEffect } from 'react';
import iconCopyright from '../assets/footer/icon-copyright-new.svg';
import footerBg from '../assets/footer/footer-bg-new.svg';
import { Facebook, Instagram } from 'lucide-react';
import LegalModal from './LegalModal';
import { PrivacyPolicyContent, TermsConditionsContent, CookiePolicyContent } from '../constants/legalText';

const Footer: React.FC = () => {
  const [activeLegal, setActiveLegal] = useState<{title: string, content: React.ReactNode} | null>(null);

  useEffect(() => {
    const handleOpenCookiePolicy = () => {
      setActiveLegal({ title: 'Politika Kolačića', content: CookiePolicyContent });
    };

    window.addEventListener('openCookiePolicy', handleOpenCookiePolicy);
    return () => {
      window.removeEventListener('openCookiePolicy', handleOpenCookiePolicy);
    };
  }, []);

  return (
    <footer className="bg-hero-blue-dark relative w-full overflow-hidden flex flex-col items-center pt-[60px] pb-[40px] md:pt-[100px] md:pb-[100px]" data-node-id="1:4652">
      
      {/* Background Illustration - Silhouette of buildings at the bottom */}
      <div className="absolute bottom-0 translate-y-[82%] left-1/2 -translate-x-1/2 w-[200%] sm:w-[150%] md:w-full max-w-[1820px] aspect-[1820/1228] z-0 pointer-events-none">
        <img 
          src={footerBg} 
          alt="" 
          className="w-full h-full object-contain object-top opacity-20 md:opacity-100"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] px-6 md:px-12 lg:px-[100px] flex flex-col items-center gap-[40px] md:gap-[60px]">
        
        {/* Social Media Row */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 mt-8 w-full max-w-5xl">
          
          {/* Niš */}
          <div className="flex flex-col items-center gap-4">
            <span className="font-montserrat font-bold text-[18px] md:text-[20px] text-white tracking-widest uppercase">Niš</span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
               <a href="https://www.facebook.com/gyrosheroespremiumfood" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                  <Facebook className="size-[24px] text-hero-yellow group-hover:text-white transition-colors" strokeWidth={1.5} />
                  <span className="font-montserrat font-semibold text-[14px] md:text-[16px] text-hero-yellow group-hover:text-white transition-colors">gyrosheroespremiumfood</span>
               </a>
               <a href="https://www.instagram.com/gyros.heroes.nis/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                  <Instagram className="size-[24px] text-hero-yellow group-hover:text-white transition-colors" strokeWidth={1.5} />
                  <span className="font-montserrat font-semibold text-[14px] md:text-[16px] text-hero-yellow group-hover:text-white transition-colors">gyros.heroes.nis</span>
               </a>
            </div>
          </div>

          {/* Vertical Divider for Desktop */}
          <div className="hidden lg:block w-px h-[60px] bg-white opacity-20"></div>

          {/* Horizontal Divider for Mobile/Tablet */}
          <div className="block lg:hidden w-[100px] h-px bg-white opacity-20"></div>

          {/* Novi Sad */}
          <div className="flex flex-col items-center gap-4">
            <span className="font-montserrat font-bold text-[18px] md:text-[20px] text-white tracking-widest uppercase">Novi Sad</span>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
               <a href="https://www.facebook.com/gyrosheroesnovisad" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                  <Facebook className="size-[24px] text-hero-yellow group-hover:text-white transition-colors" strokeWidth={1.5} />
                  <span className="font-montserrat font-semibold text-[14px] md:text-[16px] text-hero-yellow group-hover:text-white transition-colors">gyrosheroesnovisad</span>
               </a>
               <a href="https://www.instagram.com/gyros.heroes.ns/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                  <Instagram className="size-[24px] text-hero-yellow group-hover:text-white transition-colors" strokeWidth={1.5} />
                  <span className="font-montserrat font-semibold text-[14px] md:text-[16px] text-hero-yellow group-hover:text-white transition-colors">gyros.heroes.ns</span>
               </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="w-full flex flex-col items-center justify-center gap-3 md:gap-4 text-center mt-4 relative z-10 pointer-events-auto">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <button onClick={() => setActiveLegal({title: 'Uslovi Korišćenja', content: TermsConditionsContent})} className="font-montserrat font-normal text-[14px] md:text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap opacity-80 md:opacity-100">Uslovi Korišćenja</button>
                <button onClick={() => setActiveLegal({title: 'Politika Privatnosti', content: PrivacyPolicyContent})} className="font-montserrat font-normal text-[14px] md:text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap opacity-80 md:opacity-100">Politika Privatnosti</button>
            </div>
            
            <button onClick={() => setActiveLegal({title: 'Politika Kolačića', content: CookiePolicyContent})} className="font-montserrat font-normal text-[14px] md:text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap opacity-80 md:opacity-100">Podešavanje Kolačića</button>

            <div className="flex items-center gap-[4px] font-montserrat font-normal text-[14px] md:text-[16px] text-white whitespace-nowrap mt-2 opacity-80 md:opacity-100 cursor-default">
                <span>Sva prava zadržana</span>
                <img src={iconCopyright} alt="Copyright icon" className="size-[20px] md:size-[24px]" />
                <span>Gyros Heroes 2025</span>
            </div>
        </div>

      </div>

      <LegalModal 
        isOpen={!!activeLegal} 
        onClose={() => setActiveLegal(null)} 
        title={activeLegal?.title || ''} 
        content={activeLegal?.content || null} 
      />
    </footer>
  );
};

export default Footer;