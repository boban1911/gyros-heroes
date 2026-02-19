import heroBg from '../assets/hero-bg.png';
import sunImg from '../assets/sun.png';

export default function Hero() {
  return (
    <section id="hero" className="relative w-full overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img 
            src={heroBg} 
            alt="Hero Background" 
            className="w-full h-full object-cover object-top"
        />
        
        {/* Sun Decoration */}
        <div className="absolute -left-[10%] top-[-10%] w-[120%] aspect-square opacity-20 mix-blend-overlay">
            <img src={sunImg} alt="" className="w-full h-full object-contain" />
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[800px] px-4 py-20 text-center text-white">
        
        {/* Headline */}
        <h1 className="font-montserrat font-extrabold italic leading-none tracking-tighter text-[64px] md:text-8xl lg:text-[150px] xl:text-[200px] mb-12 drop-shadow-lg">
          <span className="text-hero-yellow block md:inline">HERO</span>
          <span className="block md:inline"> IS IN TOWN!</span>
        </h1>

        {/* Ordering Blocks Container */}
        <div className="flex flex-col gap-12 w-full max-w-4xl">
            
            {/* Niš Block */}
            <div className="flex flex-col items-center gap-6">
                <h2 className="font-montserrat font-bold text-2xl md:text-4xl tracking-tight">
                    Poruči <span className="text-hero-yellow">Niš</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://glovoapp.com/rs/sr/nis/gyros-heroes-nis/" target="_blank" rel="noopener noreferrer" className="bg-hero-yellow text-grey-black font-montserrat font-semibold text-sm md:text-base px-8 py-3 rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-300">
                        Poruči i pokupi - CENTAR
                    </a>
                    <a href="https://wolt.com/sr/srb/nis/restaurant/gyros-heroes-nis" target="_blank" rel="noopener noreferrer" className="bg-hero-yellow text-grey-black font-montserrat font-semibold text-sm md:text-base px-8 py-3 rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-300">
                        Poruči i pokupi - PARK SV.SAVE
                    </a>
                </div>
            </div>

            {/* Novi Sad Block */}
            <div className="flex flex-col items-center gap-6">
                <h2 className="font-montserrat font-bold text-2xl md:text-4xl tracking-tight">
                    Poruči <span className="text-hero-yellow">Novi Sad</span>
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a href="https://wolt.com/sr/srb/novi-sad/restaurant/gyros-heroes-ns" target="_blank" rel="noopener noreferrer" className="bg-hero-yellow text-grey-black font-montserrat font-semibold text-sm md:text-base px-8 py-3 rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-300">
                        Poruči i pokupi - BUL. OSLOBODJENJA
                    </a>
                </div>
            </div>

        </div>
      </div>
    </section>
  );
}
