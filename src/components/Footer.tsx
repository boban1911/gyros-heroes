import React from 'react';
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
  { label: 'Order & Pickup', name: 'Location NI 1', href: '#' },
  { label: 'Order & Pickup', name: 'Location NI 2', href: '#' },
  { label: 'Order & Pickup', name: 'Location NS', href: '#' },
  { label: 'Order & Pickup', name: 'Glovo NI', href: '#' },
  { label: 'Order & Pickup', name: 'Glovo NS', href: '#' },
  { label: 'Order & Pickup', name: 'Wolt NS', href: '#' },
];

const Footer: React.FC = () => {
  return (
    <footer className="bg-hero-blue-dark relative w-full overflow-hidden flex flex-col items-center pt-[100px] pb-[100px]" data-node-id="1:4652">
      
      {/* Background Illustration - Silhouette of buildings at the bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1820px] h-[400px] md:h-[500px] z-0 pointer-events-none overflow-hidden">
        <img 
          src={footerBg} 
          alt="" 
          className="w-full h-full object-cover object-top opacity-50 md:opacity-100"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1440px] px-4 md:px-[100px] flex flex-col items-center gap-[60px]">
        
        {/* Main Content: Links - Logo - Locations */}
        <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-[40px] xl:gap-[80px]">
          
          {/* Left Column: Navigation Links */}
          <div className="flex flex-col items-center gap-[20px] text-center w-[206px]">
            {LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="font-montserrat font-medium text-[24px] leading-[1.2] text-white hover:text-hero-yellow transition-colors capitalize"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Center Column: Logo */}
          <div className="size-[300px] md:size-[500px] shrink-0">
            <img src={footerLogo} alt="Gyros Heroes Logo" className="w-full h-full object-contain" />
          </div>

          {/* Right Column: Locations */}
          <div className="flex flex-col items-center gap-[20px] text-center font-montserrat text-[24px] text-white">
            {LOCATIONS.map((loc, index) => (
              <a 
                key={index} 
                href={loc.href}
                className="flex flex-col items-center leading-[1.2] group"
              >
                <span className="font-medium text-[24px] group-hover:text-hero-yellow transition-colors whitespace-nowrap">{loc.label}</span>
                <span className="font-bold text-hero-yellow text-[24px] whitespace-nowrap">{loc.name}</span>
              </a>
            ))}
          </div>

        </div>

        {/* Social Media Row */}
        <div className="flex flex-wrap justify-center gap-[60px] items-center">
           <a href="#" className="flex items-center gap-[10px] group">
              <div className="size-[24px]">
                <img src={iconFacebook} alt="Facebook" className="w-full h-full object-contain" />
              </div>
              <span className="font-montserrat font-semibold text-[16px] text-[#e8e1d7] group-hover:text-white transition-colors">Gyros Heroes</span>
           </a>
           <a href="#" className="flex items-center gap-[10px] group">
              <div className="size-[24px]">
                <img src={iconInstagram} alt="Instagram" className="w-full h-full object-contain" />
              </div>
              <span className="font-montserrat font-semibold text-[16px] text-[#e8e1d7] group-hover:text-white transition-colors">gyros.heroes</span>
           </a>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="w-full flex flex-wrap items-center justify-center gap-x-[24px] gap-y-4 text-center mt-auto md:px-[50px]">
            <div className="flex items-center gap-[4px] font-montserrat font-normal text-[16px] text-white whitespace-nowrap">
                <span>All right reserved</span>
                <img src={iconCopyright} alt="Copyright icon" className="size-[24px]" />
                <span>Gyros Heroes 2025</span>
            </div>
            <a href="#" className="font-montserrat font-normal text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap">Term & Conditions</a>
            <a href="#" className="font-montserrat font-normal text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap">Privacy Policy</a>
            <a href="#" className="font-montserrat font-normal text-[16px] text-white hover:text-hero-yellow transition-colors whitespace-nowrap">Cookie Settings</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
