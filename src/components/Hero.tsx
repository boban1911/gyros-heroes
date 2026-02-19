import heroBg from '../assets/hero-bg.png';
import sunImg from '../assets/sun.png';

export default function Hero() {
  return (
    <section id="hero" className="flex justify-center w-full px-[20px]">
      <div className="relative w-full max-w-[1400px] rounded-t-[100px] overflow-hidden min-h-[1100px] bg-hero-blue">
        {/* Background Image Container */}
        <div className="absolute inset-0 h-[300px] md:h-[500px] lg:h-[708px] w-full pointer-events-none">
            <div className="absolute inset-0 overflow-hidden rounded-t-[100px]">
                <img 
                    src={heroBg} 
                    alt="" 
                    className="absolute h-full w-full object-cover"
                />
            </div>
            
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
                    <h2 className="font-montserrat font-bold text-2xl md:text-4xl tracking-tight">
                        Poruči <span className="text-hero-yellow">Niš</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="https://glovoapp.com/rs/sr/nis/gyros-heroes-nis/" target="_blank" rel="noopener noreferrer" className="bg-hero-yellow text-grey-black font-montserrat text-sm md:text-base px-8 py-3 rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-300">
                            <span className="font-medium">Poruči i pokupi</span><span className="font-bold"> - CENTAR</span>
                        </a>
                        <a href="https://wolt.com/sr/srb/nis/restaurant/gyros-heroes-nis" target="_blank" rel="noopener noreferrer" className="bg-hero-yellow text-grey-black font-montserrat text-sm md:text-base px-8 py-3 rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-300">
                            <span className="font-medium">Poruči i pokupi</span><span className="font-bold"> - PARK SV.SAVE</span>
                        </a>
                    </div>
                </div>

                {/* Novi Sad Block */}
                <div className="flex flex-col items-center gap-6">
                    <h2 className="font-montserrat font-bold text-2xl md:text-4xl tracking-tight">
                        Poruči <span className="text-hero-yellow">Novi Sad</span>
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a href="https://wolt.com/sr/srb/novi-sad/restaurant/gyros-heroes-ns" target="_blank" rel="noopener noreferrer" className="bg-hero-yellow text-grey-black font-montserrat text-sm md:text-base px-8 py-3 rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-300">
                            <span className="font-medium">Poruči i pokupi</span><span className="font-bold"> - BUL. OSLOBODJENJA</span>
                        </a>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </section>
  );
}
