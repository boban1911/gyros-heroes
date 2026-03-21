import React from 'react';
import joinUsImg from '../assets/join-us.webp';

const JoinUs: React.FC = () => {
  return (
    <section id="posao" className="w-full bg-hero-blue-dark px-[20px] py-[100px] flex flex-col items-center rounded-b-[40px] lg:rounded-b-lg relative z-10">
      <div className="max-w-[1400px] w-full flex flex-col lg:flex-row gap-xs lg:gap-sm items-stretch">
        
        {/* Image - Left on Desktop, Bottom on Mobile */}
        <div className="order-2 lg:order-1 w-full lg:flex-1 h-[400px] lg:h-[600px] relative rounded-[40px] lg:rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <img 
            src={joinUsImg} 
            alt="Gyros Heroes Team" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Content Box - Right on Desktop, Top on Mobile */}
        <div className="order-1 lg:order-2 w-full lg:flex-1 bg-hero-green rounded-[40px] lg:rounded-lg p-6 md:p-10 lg:p-[40px] flex flex-col items-center justify-center text-center">
          <div className="max-w-[614px] flex flex-col items-center gap-[30px]">
            <h2 className="font-montserrat font-bold text-[48px] md:text-[64px] lg:text-[80px] leading-[1.1] tracking-tight">
              <span className="text-hero-blue-dark block">Pridruži se</span>
              <span className="text-white italic block">Hero timu!</span>
            </h2>

            <p className="font-montserrat font-medium text-white text-base md:text-lg lg:text-[20px] leading-[1.5]">
              Pridruži se Hero timu i postani deo brenda koji postavlja više standarde u modernom fast-food segmentu. 
              Tražimo motivisane, odgovorne i energične ljude koji žele stabilan posao, jasnu organizaciju i rad u brzo rastućem sistemu. 
              Ako želiš da radiš u dinamičnom okruženju, da učiš, napreduješ i budeš deo tima koji drži kvalitet na prvom mestu, 
              popuni kratku anketu i uđi u našu bazu kandidata. Ovo je prvi korak ka tome da postaneš deo Gyros Heroes ekipe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 lg:gap-[30px] w-full sm:w-auto">
              <a 
                href="https://forms.gle/wRqPcAD8RmUtKPnBA" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap"
              >
                Popuni Anketu -&nbsp;<span className="font-bold">NI</span>
              </a>
              <a 
                href="https://forms.gle/FjeKMKbKnpdTHrCw6" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-hero-yellow text-grey-black font-montserrat text-[14px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap"
              >
                Popuni Anketu -&nbsp;<span className="font-bold">NS</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinUs;
