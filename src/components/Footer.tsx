import React from 'react';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-hero-blue-dark text-white py-12 px-4 md:px-8 font-inter">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo and Description */}
        <div className="flex flex-col space-y-4">
          <div className="w-32 h-32 relative">
            <Logo className="w-full h-full" />
          </div>
          <p className="text-sm text-grey-light">
            Bringing the taste of authentic Greek gyros to your neighborhood.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="https://facebook.com/gyrosheroes" target="_blank" rel="noopener noreferrer" className="hover:text-hero-yellow transition-colors" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="https://instagram.com/gyrosheroes" target="_blank" rel="noopener noreferrer" className="hover:text-hero-yellow transition-colors" aria-label="Instagram">
              <Instagram size={24} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-bold font-montserrat text-hero-yellow">Brzi Linkovi</h3>
          <ul className="space-y-2">
            <li><a href="#about" className="hover:text-hero-yellow transition-colors">O Nama</a></li>
            <li><a href="#menu" className="hover:text-hero-yellow transition-colors">Meni</a></li>
            <li><a href="#locations" className="hover:text-hero-yellow transition-colors">Lokacije</a></li>
            <li><a href="#testimonials" className="hover:text-hero-yellow transition-colors">Utisci</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-bold font-montserrat text-hero-yellow">Kontakt</h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <MapPin size={20} className="text-hero-yellow mt-1 flex-shrink-0" />
              <span>Trg Republike 5,<br/>11000 Beograd</span>
            </li>
            <li className="flex items-center space-x-3">
              <Phone size={20} className="text-hero-yellow flex-shrink-0" />
              <a href="tel:+381111234567" className="hover:text-hero-yellow transition-colors">+381 11 123 4567</a>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={20} className="text-hero-yellow flex-shrink-0" />
              <a href="mailto:info@gyrosheroes.com" className="hover:text-hero-yellow transition-colors">info@gyrosheroes.com</a>
            </li>
          </ul>
        </div>

        {/* Opening Hours or Other Info (Optional) */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-bold font-montserrat text-hero-yellow">Radno Vreme</h3>
          <ul className="space-y-2 text-sm text-grey-light">
            <li className="flex justify-between">
              <span>Pon - Pet:</span>
              <span>09:00 - 23:00</span>
            </li>
            <li className="flex justify-between">
              <span>Subota:</span>
              <span>10:00 - 00:00</span>
            </li>
            <li className="flex justify-between">
              <span>Nedelja:</span>
              <span>10:00 - 22:00</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-white/10 text-center text-sm text-grey-light">
        <p>&copy; {new Date().getFullYear()} Gyros Heroes. Sva prava zadržana.</p>
      </div>
    </footer>
  );
};

export default Footer;
