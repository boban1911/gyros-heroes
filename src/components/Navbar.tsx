import { useState } from 'react';
import Logo from './Logo';
import menuIcon from '../assets/icon-menu.svg';
import arrowIcon from '../assets/icon-arrow.svg';
import { X } from 'lucide-react';

const LINKS = [
  { name: 'Hero', href: '#hero' },
  { name: 'O nama', href: '#o-nama' },
  { name: 'Meni', href: '#meni' },
  { name: 'Lokacije', href: '#lokacije' },
  { name: 'Posao', href: '#posao' },
  { name: 'Testimonijali', href: '#testimonijali' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Banner - Yellow */}
      <div className="relative z-50 pt-[10px] flex justify-center w-full px-[20px]">
        <div className="bg-hero-yellow w-full max-w-[1400px] rounded-[50px] py-[10px] px-[20px] nav:px-[100px] flex justify-center items-center text-center shadow-sm">
            <p className="font-inter font-medium text-[14px] text-grey-black">
            Limited-Time Offer! Get <span className="font-bold">20% OFF on Wolt</span> – Order Now!
            </p>
        </div>
      </div>

      {/* Main Navbar - Blue */}
      <div className="sticky top-[10px] z-50 flex justify-center w-full mt-[10px] px-[20px]">
        <div className="bg-hero-blue w-full max-w-[1400px] rounded-[30px] py-[10px] px-[20px] nav:px-[100px] flex items-center justify-between shadow-hero-xs">
            
            {/* Logo */}
            <div className="h-[40px] md:h-[60px] aspect-[355/60] relative shrink-0">
               <Logo className="w-full h-full" />
            </div>

                    {/* Desktop Links */}
                    <div className="hidden nav:flex items-center gap-[10px]">
                      {LINKS.map((link) => (
                        <a
                          key={link.name}
                          href={link.href}
                          onClick={(e) => handleLinkClick(e, link.href)}
                          className="px-[15px] py-[10px] rounded-[16px] text-white font-montserrat font-semibold text-[14px] hover:bg-white/10 transition-colors whitespace-nowrap"
                        >
                          {link.name}
                        </a>
                      ))}
                    </div>
            
                    {/* CTA & Mobile Menu Toggle */}
                    <div className="flex items-center gap-4">
                        {/* CTA Button */}
                        <a 
                          href="#" 
                          className="hidden sm:flex items-center justify-center gap-[8px] px-[16px] py-[10px] h-[40px] rounded-full border-2 border-dandelion text-dandelion font-montserrat font-semibold text-[14px] hover:bg-dandelion/10 transition-colors whitespace-nowrap"
                        >
                            <div className="w-[24px] h-[24px] relative shrink-0">
                                <img src={arrowIcon} alt="" className="absolute top-1/4 left-1/4 w-1/2 h-1/2 object-contain" />
                            </div>
                            Order & Pick Up
                        </a>
            
                        {/* Mobile Hamburger */}
                        <button 
                            className="nav:hidden text-white p-2"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <img src={menuIcon} alt="" className="w-6 h-6" />
                        </button>
                    </div>        </div>
      </div>

      {/* Mobile Slide-over Menu */}
      <div className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}>
        <div 
            className={`fixed top-0 right-0 h-full w-[300px] bg-hero-blue p-6 shadow-xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-8">
                <span className="text-white font-montserrat font-bold text-xl">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="text-white p-2" aria-label="Close menu">
                    <X size={24} />
                </button>
            </div>
            <div className="flex flex-col gap-4">
                {LINKS.map((link) => (
                    <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-white font-montserrat font-semibold text-[16px] py-2 border-b border-white/10"
                    >
                    {link.name}
                    </a>
                ))}
                 <a 
                    href="#" 
                    className="mt-4 flex items-center justify-center gap-[8px] px-[16px] py-[10px] h-[40px] rounded-full border-2 border-dandelion text-dandelion font-montserrat font-semibold text-[14px]"
                >
                    <div className="w-[24px] h-[24px] relative shrink-0">
                        <img src={arrowIcon} alt="" className="absolute top-1/4 left-1/4 w-1/2 h-1/2 object-contain" />
                    </div>
                    Order & Pick Up
                </a>
            </div>
        </div>
      </div>
    </>
  );
}