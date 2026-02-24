import React from 'react';

const OrderHero: React.FC = () => {
  return (
    <section className="w-full px-[20px] pb-20 relative z-10">
      <div className="w-full max-w-[1400px] mx-auto bg-hero-green rounded-[40px] lg:rounded-[80px] p-[20px] lg:p-[50px] flex flex-col lg:flex-row items-center lg:items-center justify-between gap-[30px] lg:gap-[50px] xl:gap-[150px]">
        
        {/* Title Section */}
        <div className="flex flex-col items-center lg:items-start shrink-0">
          <h2 className="font-montserrat font-bold leading-[1.2] text-[32px] lg:text-[64px] xl:text-[80px] text-center lg:text-left">
            <span className="block text-white">Poruči svoj</span>
            <span className="block text-hero-yellow italic font-bold-italic">Hero!</span>
          </h2>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-[30px] lg:gap-[40px] w-full lg:w-auto lg:flex-1">
          
          {/* Description Text */}
          <p className="font-montserrat font-normal text-[16px] lg:text-[18px] xl:text-[20px] text-white leading-[1.4] text-center lg:text-left whitespace-pre-wrap">
            Poruči svoj omiljeni gyros brzo i jednostavno putem Glovo/Wolt aplikacije. Dovoljno je da klikneš na dugme ispod, izabereš proizvod i potvrdiš porudžbinu — hranu pripremamo odmah, a dostava stiže sveža i topla. Tvoj sledeći giros je na jedan klik od tebe.
          </p>

          {/* Buttons Container */}
          <div className="flex flex-col gap-[20px] lg:gap-[30px] w-full lg:items-start">
            
            {/* Top Row: Glovo NI */}
            <div className="flex w-full lg:w-auto">
               <a 
                href="https://glovoapp.com/rs/sr/nis/gyros-heroes-nis/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full lg:w-auto bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap gap-1"
              >
                <span className="font-medium">Poruči Glovo -</span>
                <span className="font-bold">NI</span>
              </a>
            </div>

            {/* Bottom Row: Glovo NS & Wolt NS */}
            <div className="flex flex-col md:flex-row gap-[20px] lg:gap-[30px] w-full lg:w-auto">
              <a 
                href="#" // TODO: Add Glovo NS link when available
                className="w-full lg:w-auto bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap gap-1"
                onClick={(e) => e.preventDefault()} // Prevent default for placeholder
              >
                <span className="font-medium">Poruči Glovo -</span>
                <span className="font-bold">NS</span>
              </a>
              <a 
                href="https://wolt.com/sr/srb/novi-sad/restaurant/gyros-heroes-ns" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full lg:w-auto bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap gap-1"
              >
                <span className="font-medium">Poruči Wolt -</span>
                <span className="font-bold">NS</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default OrderHero;
