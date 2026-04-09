import heroBg from '../assets/hero-bg.webp';
import SuperheroMascot from './SuperheroMascot';
import { trackEvent } from '../utils/analytics';

export default function Hero() {
  return (
    <section id="hero" className="flex justify-center w-full px-[20px] relative">
      <div className="relative w-full max-w-[1400px]">
        <div className="relative w-full rounded-t-[40px] lg:rounded-t-[100px] overflow-hidden min-h-[750px] bg-hero-blue">
          {/* Background Image Container */}
          <div className="absolute inset-0 h-[300px] md:h-[500px] lg:h-[708px] w-full pointer-events-none">
              <div className="absolute inset-0 overflow-hidden rounded-t-[40px] lg:rounded-t-[100px]">
                  <img 
                      src={heroBg} 
                      alt="" 
                      className="absolute h-full w-full object-cover"
                  />
              </div>
              
              {/* Gradient Overlay from design */}
              <div 
                  className="absolute inset-0" 
                  style={{ 
                      backgroundImage: "linear-gradient(180deg, rgba(72, 102, 176, 0) 55%, rgb(72, 102, 176) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.3) 100%)" 
                  }} 
              />
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col items-center justify-start w-full px-4 pt-[150px] md:pt-[204px] pb-20 text-center text-white">
              
              {/* Headline */}
              <h1 className="w-full font-montserrat font-extrabold leading-none text-[64px] md:text-[150px] xl:text-[250px] mb-12 drop-shadow-lg flex flex-col items-center">
                  <span className="block">
                      <span className="text-hero-yellow italic">HERO</span>
                      <span> IS</span>
                  </span>
                  <span className="block">IN TOWN!</span>
              </h1>

              {/* Ordering Blocks Container */}
              <div className="flex flex-col gap-12 w-full max-w-4xl">
                  
                  {/* Niš Block */}
                  <div className="flex flex-col items-center gap-6">
                      <h2 className="font-montserrat font-bold text-[24px] md:text-[32px] tracking-[-1.2px] md:tracking-[-1.6px]">
                          Poruči Giros <span className="text-hero-yellow">Niš</span>
                      </h2>
                                          <div className="flex flex-col items-center md:flex-row gap-4 w-full md:w-auto">
                                              <a href="tel:0637389890" className="bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[44px] md:h-[60px] w-fit px-4 md:px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap" onClick={() => trackEvent('Order Conversion', 'Pickup Click', 'Centar - Niš')}>
                                                  <span className="font-medium">Poruči i pokupi</span><span className="font-bold">&nbsp;- CENTAR</span>
                                              </a>
                                              <a href="tel:0659381784" className="bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[44px] md:h-[60px] w-fit px-4 md:px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap" onClick={() => trackEvent('Order Conversion', 'Pickup Click', 'Park Sv. Save - Niš')}>
                                                  <span className="font-medium">Poruči i pokupi</span><span className="font-bold">&nbsp;- PARK SV.SAVE</span>
                                              </a>
                                          </div>
                                      </div>
                      
                                      {/* Novi Sad Block */}
                                      <div className="flex flex-col items-center gap-6">
                                          <h2 className="font-montserrat font-bold text-[24px] md:text-[32px] tracking-[-1.2px] md:tracking-[-1.6px]">
                                              Poruči Giros <span className="text-hero-yellow">Novi Sad</span>
                                          </h2>
                                          <div className="flex flex-col items-center md:flex-row gap-4 w-full md:w-auto">
                                              <a href="tel:066373666" className="bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[44px] md:h-[60px] w-fit px-4 md:px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap" onClick={() => trackEvent('Order Conversion', 'Pickup Click', 'Bul. Oslobodjenja - Novi Sad')}>
                                                  <span className="font-medium">Poruči i pokupi</span><span className="font-bold">&nbsp;- BUL. OSLOBODJENJA</span>
                                              </a>
                                          </div>
                  </div>

              </div>
          </div>
        </div>
        <SuperheroMascot />
      </div>
    </section>
  );
}
