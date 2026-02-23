import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import phoneIcon from '../assets/phone-call.png';
import locationIcon from '../assets/location.png';

const LOCATIONS_DATA = [
  {
    city: 'Niš',
    address: 'Nikole Pašića 39',
    phone: '063 738 9890',
    mapSrc: 'https://maps.google.com/maps?q=Nikole+Pašića+39,+Niš&t=&z=15&ie=UTF8&iwloc=&output=embed',
    hours: 'Pon - Sub: 09:00 - 23:00, Ned: 10:00 - 22:00' // Placeholder hours, verify if needed
  },
  {
    city: 'Niš',
    address: 'Park Sv. Save',
    phone: '065 938 1784',
    mapSrc: 'https://maps.google.com/maps?q=Park+Svetog+Save,+Niš&t=&z=15&ie=UTF8&iwloc=&output=embed',
    hours: 'Pon - Sub: 09:00 - 23:00, Ned: 10:00 - 22:00'
  },
  {
    city: 'Novi Sad',
    address: 'Bulevar Oslobođenja 89e',
    phone: '066 373 666',
    mapSrc: 'https://maps.google.com/maps?q=Bulevar+Oslobođenja+89e,+Novi+Sad&t=&z=15&ie=UTF8&iwloc=&output=embed',
    hours: 'Pon - Sub: 09:00 - 23:00, Ned: 10:00 - 22:00'
  }
];

const Locations: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-hero-blue flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-[40px] md:pt-[60px] pb-20 px-6 md:px-[100px] w-full max-w-[1440px] mx-auto flex flex-col items-center gap-12">
        
        <div className="text-center space-y-4">
          <h1 className="font-montserrat font-bold text-[40px] md:text-[60px] text-white leading-tight">
            Naše <span className="text-hero-yellow">Lokacije</span>
          </h1>
          <p className="font-montserrat text-[16px] md:text-[20px] text-white/80 max-w-2xl mx-auto">
            Posetite nas na jednoj od naših lokacija u Nišu ili Novom Sadu. Uživajte u autentičnom ukusu girosa u prijatnom ambijentu.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
          {LOCATIONS_DATA.map((loc, index) => (
            <div key={index} className="bg-hero-green rounded-[40px] overflow-hidden shadow-lg flex flex-col h-full transition-transform hover:scale-[1.02] duration-300">
              {/* Map Section */}
              <div className="h-[250px] w-full relative bg-gray-200">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={loc.mapSrc} 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0}
                  title={`Map for ${loc.address}`}
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
              
              {/* Info Section */}
              <div className="p-[20px] md:p-[30px] flex flex-col gap-6 flex-grow">
                <div className="flex flex-col gap-2">
                  <h3 className="font-montserrat font-black text-[32px] md:text-[36px] text-white leading-none">{loc.city}</h3>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address + ', ' + loc.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group/address"
                  >
                    <img src={locationIcon} alt="" className="w-6 h-6 object-contain shrink-0 group-hover/address:scale-110 transition-transform" />
                    <p className="font-montserrat font-semibold text-[18px] text-white leading-tight group-hover/address:text-hero-yellow transition-colors">{loc.address}</p>
                  </a>
                </div>
                
                <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center shrink-0">
                             <img src={phoneIcon} alt="Phone" className="w-full h-full object-contain" />
                        </div>
                        <a href={`tel:${loc.phone.replace(/\s/g, '')}`} className="font-montserrat font-bold text-[22px] text-white hover:text-hero-yellow transition-colors tracking-wide">
                            {loc.phone}
                        </a>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="w-6 h-6 flex items-center justify-center shrink-0 text-grey-black">
                             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <p className="font-montserrat font-medium text-[15px] text-grey-black leading-tight">{loc.hours}</p>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Locations;