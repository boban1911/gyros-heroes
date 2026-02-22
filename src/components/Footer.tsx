import React from 'react';
import footerLogo from '../assets/footer/footer-logo.png';
import iconCopyright from '../assets/footer/icon-copyright.svg';
import iconFacebook from '../assets/footer/icon-facebook.svg';
import iconInstagram from '../assets/footer/icon-instagram.svg';
import footerBg from '../assets/footer/footer-bg.svg';

const LINKS = [
  { name: 'Hero', href: '#hero' },
  { name: 'O nama', href: '#about' },
  { name: 'Meni', href: '#menu' },
  { name: 'Lokacije', href: '#locations' },
  { name: 'Posao', href: '#jobs' },
  { name: 'Testimonijali', href: '#testimonials' },
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
    <footer className="bg-hero-blue-dark relative w-full overflow-hidden flex flex-col items-center pt-[100px] pb-[60px]" data-node-id="1:4652">
      {/* Background Castle Image */}
      <div className="absolute bottom-0 w-full flex justify-center pointer-events-none">
        <img 
          src={footerBg} 
          alt="" 
          className="w-full max-w-[1819px] min-w-[1200px] object-cover object-bottom"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] px-4 flex flex-col items-center gap-[60px]">
        
        {/* Main Content: Links - Logo - Locations */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-[40px] lg:gap-[80px]">
          
          {/* Left Column: Navigation Links */}
          <div className="flex flex-col items-center gap-[20px] text-center">
            {LINKS.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="font-montserrat font-medium text-[24px] leading-[1.2] text-white hover:text-hero-yellow transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Center Column: Logo */}
          <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] shrink-0">
            <img src={footerLogo} alt="Gyros Heroes" className="w-full h-full object-contain" />
          </div>

          {/* Right Column: Locations */}
          <div className="flex flex-col items-center gap-[20px] text-center font-montserrat text-[24px] text-white">
            {LOCATIONS.map((loc, index) => (
              <a 
                key={index} 
                href={loc.href}
                className="flex flex-col items-center leading-[1.2] group"
              >
                <span className="text-[20px] lg:text-[24px] group-hover:text-hero-yellow transition-colors">{loc.label}</span>
                <span className="font-bold text-hero-yellow text-[20px] lg:text-[24px]">{loc.name}</span>
              </a>
            ))}
          </div>

        </div>

        {/* Social Media Icons */}
        <div className="flex flex-wrap justify-center gap-[40px] md:gap-[60px] mt-[20px]">
           <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-[10px] group">
              <div className="w-[24px] h-[24px]">
                <img src={iconFacebook} alt="Facebook" className="w-full h-full" />
              </div>
              <span className="font-montserrat font-semibold text-[16px] text-[#E8E1D7] group-hover:text-white transition-colors">Gyros Heroes</span>
           </a>
           <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-[10px] group">
              <div className="w-[24px] h-[24px]">
                <img src={iconInstagram} alt="Instagram" className="w-full h-full" />
              </div>
              <span className="font-montserrat font-semibold text-[16px] text-[#E8E1D7] group-hover:text-white transition-colors">Gyros Heroes</span>
           </a>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-[24px] mt-[40px] text-center">
            <div className="flex items-center gap-[4px] font-montserrat font-normal text-[16px] text-white">
                <span>All right reserved</span>
                <img src={iconCopyright} alt="Copyright" className="w-[24px] h-[24px]" />
                <span>Gyros Heroes {new Date().getFullYear()}</span>
            </div>
            <a href="#" className="font-montserrat font-normal text-[16px] text-white hover:text-hero-yellow transition-colors">Term & Conditions</a>
            <a href="#" className="font-montserrat font-normal text-[16px] text-white hover:text-hero-yellow transition-colors">Privacy Policy</a>
            <a href="#" className="font-montserrat font-normal text-[16px] text-white hover:text-hero-yellow transition-colors">Cookie Settings</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;