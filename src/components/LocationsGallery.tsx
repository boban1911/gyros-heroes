import React from 'react';
import GallerySlider from './GallerySlider';

const locations = [
  {
    name: 'NI CENTAR',
    link: 'https://glovoapp.com/rs/sr/nis/gyros-heroes-nis/'
  },
  {
    name: 'NI PARK SV.SAVE',
    link: 'https://wolt.com/sr/srb/nis/restaurant/gyros-heroes-nis'
  },
  {
    name: 'NS BUL. OSLOBODJENJA',
    link: 'https://wolt.com/sr/srb/novi-sad/restaurant/gyros-heroes-ns'
  }
];

export default function LocationsGallery() {
  return (
    <section id="lokacije" className="w-full bg-hero-blue-dark py-20 flex flex-col items-center">
      <div className="w-full max-w-[1400px] px-[20px] flex flex-col items-center gap-12 md:gap-16">
        
        {/* Title & Description */}
        <div className="flex flex-col gap-8 items-center text-center max-w-4xl">
          <h2 className="font-montserrat font-bold text-[48px] md:text-[80px] leading-[1.1] text-white">
            Pogledaj naše <br />
            <span className="text-hero-green italic italic-important">Lokacije & galeriju</span>
          </h2>
          <p className="font-montserrat text-[16px] md:text-[20px] text-grey-light leading-relaxed max-w-4xl">
            Naši lokali su uređeni da pruže brzo i prijatno iskustvo, sa modernim enterijerom i kuhinjom spremnom da ispuni sve porudžbine. Svaki posetilac može da očekuje isti visok kvalitet hrane i usluge, bez obzira koji lokal poseti. U galeriji možeš da pogledaš atmosferu, detalje iz kuhinje i naše najpopularnije obroke, i stekneš utisak šta te očekuje kada dođeš kod nas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-6 justify-center w-full">
          {locations.map((loc, idx) => (
            <a 
              key={idx}
              href={loc.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-hero-yellow text-grey-black font-montserrat font-semibold text-[14px] md:text-[16px] h-[50px] md:h-[60px] px-6 md:px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-all duration-300 whitespace-nowrap gap-2"
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Poruči i pokupi <span className="font-bold">{loc.name}</span></span>
            </a>
          ))}
        </div>

        {/* Gallery Slider - No overflow-hidden here, handled by Slider component */}
        <div className="w-full mt-4">
          <GallerySlider />
        </div>

      </div>
    </section>
  );
}