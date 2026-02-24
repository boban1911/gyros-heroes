import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import footerLogo from '../assets/footer/footer-logo-new.svg';
import iconCopyright from '../assets/footer/icon-copyright-new.svg';
import iconFacebook from '../assets/footer/icon-facebook-new.svg';
import iconInstagram from '../assets/footer/icon-instagram-new.svg';
import footerBg from '../assets/footer/footer-bg-new.svg';

const LINKS = [
  { name: 'Hero', href: '#hero' },
  { name: 'O nama', href: '#o-nama' },
  { name: 'Meni', href: '#meni' },
  { name: 'Lokacije', href: '#lokacije' },
  { name: 'Posao', href: '#posao' },
  { name: 'Testimonijali', href: '#testimonijali' },
];

const LOCATIONS = [
  { label: 'Poruči i Pokupi', name: 'Nikole Pašića 39', href: '#lokacije' },
  { label: 'Poruči i Pokupi', name: 'Park Sv. Save', href: '#lokacije' },
  { label: 'Poruči i Pokupi', name: 'Bulevar Oslobođenja 89e', href: '#lokacije' },
  { label: 'PORUČI ZA DOSTAVU NIŠ', name: 'Glovo', href: 'https://glovoapp.com/rs/sr/nis/gyros-heroes-nis/' },
  { label: 'PORUČI ZA DOSTAVU NOVI SAD', name: 'Glovo', href: 'https://glovoapp.com/rs/sr/novi-sad/gyros-heroes/' },
  { label: 'PORUČI ZA DOSTAVU NOVI SAD', name: 'Wolt', href: 'https://wolt.com/sr/srb/novi-sad/restaurant/gyros-heroes' },
];

const Footer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    if (href.startsWith('/')) {
      navigate(href);
      window.scrollTo(0, 0);
    } else {
      // Hash link
      if (location.pathname === '/') {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(`/${href}`);
      }
    }
  };

  return (
    <footer className="bg-hero-blue-dark relative w-full overflow-hidden flex flex-col items-center pt-[60px] pb-[40px] md:pt-[100px] md:pb-[100px]" data-node-id="1:4652">
      
      {/* Background Illustration - Silhouette of buildings at the bottom */}
      {/* Pushed down further to match the subtle rooftops in the design */}
      <div className="absolute -bottom-[1050px] md:-bottom-[1000px] left-1/2 -translate-x-1/2 w-full max-w-[1820px] h-[1228px] z-0 pointer-events-none">
        <img 
          src={footerBg} 
          alt="" 
          className="w-full h-full object-contain object-top opacity-20 md:opacity-100"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] px-6 md:px-[100px] flex flex-col items-center gap-[40px] md:gap-[60px]">
        
        {/* Main Content: Links - Logo - Locations */}
        {/* On mobile, we stack them but keep the Logo smaller and the spacing tighter */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-[30px] lg:gap-[60px] xl:gap-[80px]">
          
          {/* Left Column: Navigation Links */}
          <div className="flex flex-col items-center gap-3 md:gap-[20px] text-center w-[206px]">
            {LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={(e) => handleLinkClick(e, link.href)}
                className="font-montserrat font-medium text-[18px] md:text-[24px] leading-tight text-white hover:text-hero-yellow transition-colors capitalize cursor-pointer"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Center Column: Logo */}
          <div className="size-[180px] md:size-[350px] lg:size-[500px] shrink-0 my-4 md:my-0 cursor-pointer" onClick={() => navigate('/')}>
            <img src={footerLogo} alt="Gyros Heroes Logo" className="w-full h-full object-contain" />
          </div>

          {/* Right Column: Locations */}
          <div className="flex flex-col items-center gap-4 md:gap-[20px] text-center font-montserrat text-white">
            {LOCATIONS.map((loc, index) => (
              <a 
                key={index} 
                href={loc.href}
                onClick={(e) => !loc.href.startsWith('http') && handleLinkClick(e, loc.href)}
                className="flex flex-col items-center leading-tight group cursor-pointer"
                target={loc.href.startsWith('http') ? '_blank' : undefined}
                rel={loc.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <span className="font-medium text-[18px] md:text-[24px] group-hover:text-hero-yellow transition-colors whitespace-nowrap">{loc.label}</span>
                <span className="font-bold text-hero-yellow text-[18px] md:text-[24px] whitespace-nowrap">{loc.name}</span>
              </a>
            ))}
          </div>

        </div>

        {/* Social Media Row */}
        <div className="flex flex-wrap justify-center gap-[30px] md:gap-[60px] items-center mt-4">
           <a href="#" className="flex items-center gap-[10px] group">
              <div className="size-[20px] md:size-[24px]">
                <img src={iconFacebook} alt="Facebook" className="w-full h-full object-contain" />
              </div>
              <span className="font-montserrat font-semibold text-[14px] md:text-[16px] text-hero-yellow group-hover:text-white transition-colors">Gyros Heroes</span>
           </a>
           <a href="#" className="flex items-center gap-[10px] group">
              <div className="size-[20px] md:size-[24px] flex items-center justify-center">
                {/* Applied a filter to make the Instagram icon match the yellow theme */}
                <img 
                    src={iconInstagram} 
                    alt="Instagram" 
                    className="w-full h-full object-contain" 
                    style={{ filter: 'brightness(0) saturate(100%) invert(74%) sepia(77%) saturate(1041%) hue-rotate(351deg) brightness(101%) contrast(101%)' }}
                />
              </div>
              <span className="font-montserrat font-semibold text-[14px] md:text-[16px] text-hero-yellow group-hover:text-white transition-colors">gyros.heroes</span>
           </a>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        {/* Closely follows the 3-row layout from small-footer.png on mobile */}
        <div className="w-full flex flex-col items-center justify-center gap-3 md:gap-4 text-center mt-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <a href="#" className="font-montserrat font-normal text-[14px] md:text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap opacity-80 md:opacity-100">Term & Conditions</a>
                <a href="#" className="font-montserrat font-normal text-[14px] md:text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap opacity-80 md:opacity-100">Privacy Policy</a>
            </div>
            
            <a href="#" className="font-montserrat font-normal text-[14px] md:text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap opacity-80 md:opacity-100">Cookie Settings</a>

            <div className="flex items-center gap-[4px] font-montserrat font-normal text-[14px] md:text-[16px] text-white whitespace-nowrap mt-2 opacity-80 md:opacity-100">
                <span>All right reserved</span>
                <img src={iconCopyright} alt="Copyright icon" className="size-[20px] md:size-[24px]" />
                <span>Gyros Heroes 2025</span>
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;