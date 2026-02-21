import React from 'react';
import mascotImg from '../assets/about-us-mascot.svg';
import aboutUsBg from '../assets/about-us-bg.webp';
import iconGyros from '../assets/icon-gyros.svg';
import iconSpecial from '../assets/icon-special.svg';
import iconKids from '../assets/icon-kids.svg';
import iconSalad from '../assets/icon-salad.svg';

const AboutUs = () => {
  const brandStory = "Gyros Heroes je savremen fast-food koncept koji spaja autentičan grčki ukus sa jasnim fokusom na kvalitet mesa i pažljivo razvijenu marinadu. Brend je nastao u Nišu i izgradio prepoznatljiv identitet kroz velike porcije, kvalitet i inovativnu prezentaciju proizvoda. Naš meni obuhvata rane veličine girosa, obrok kombinacija i priloga, namenjenih gostima koji očekuju više od standardnog girosa. Posvećeni smo brzoj usluzi, svežim sastojcima i iskustvu koje postavlja novi standard u ovoj kategoriji. Gyros Heroes je mesto gde se klasični giros pretvara u bogat i nezaboravan obrok.";

  const cards = [
    {
      title: "GYROS",
      icon: iconGyros,
      description: "Sočno meso u autentičnoj marinadi, spakovano u originalnu grčku pitu sa prilozima po tvom izboru, na tebi je samo da odabereš veličinu"
    },
    {
      title: "HEROES SPECIAL",
      icon: iconSpecial,
      description: "Za one koji žele nešto drugačije od klasičnog girosa, sve u herojskim porcijama"
    },
    {
      title: "KIDS MENU",
      icon: iconKids,
      description: "Sve što deca vole - jednostavno, ukusno i taman"
    },
    {
      title: "PIĆA I NAMAZI",
      icon: iconSalad,
      description: "Izaberi neki od pravih grčkih namaza poput neodoljivog tzatzikija kojeg sami pravimo i uz to dodaj nešto iz našeg PEPSI programa pića, za potpun ugođaj"
    }
  ];

  return (
    <section id="o-nama" className="relative w-full bg-hero-blue pt-0 pb-[40px] md:pb-[100px] xl:py-[100px] flex flex-col items-center gap-[30px] md:gap-[60px] overflow-hidden">
      
      {/* Background Illustration */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-80">
        <img 
          src={aboutUsBg} 
          alt="" 
          className="w-full h-full object-cover min-w-[1440px]" 
        />
      </div>

      {/* Title */}
      <div className="relative z-10 text-center px-4">
        <h2 className="font-montserrat font-bold text-[60px] md:text-[120px] text-white leading-none tracking-[-3px] md:tracking-[-6px]">
          O <span className="text-hero-yellow italic">Nama</span>
        </h2>
      </div>

      {/* Description */}
      <div className="relative z-10 max-w-[900px] px-6 text-center">
        <p className="font-montserrat font-normal text-[16px] md:text-[20px] text-grey-light leading-[1.4]">
          {brandStory}
        </p>
      </div>

      {/* Content Grid/Stack */}
      <div className="relative z-10 w-full max-w-[1240px] px-4">
        
        {/* Desktop Layout */}
        <div className="hidden xl:flex items-center justify-between relative h-[600px]">
          {/* Left Cards */}
          <div className="flex flex-col gap-[30px] w-[600px] absolute left-0 top-1/2 -translate-y-1/2 z-0">
            {cards.slice(0, 2).map((card, idx) => (
              <div key={idx} className="bg-hero-green rounded-[80px] py-[30px] pl-[50px] pr-[260px] flex flex-col gap-2 relative">
                <div className="flex items-center gap-[15px]">
                  <img src={card.icon} alt="" className="size-[50px]" />
                  <h3 className="font-montserrat font-black text-[28px] text-white leading-tight transform -rotate-[0.12deg]">{card.title}</h3>
                </div>
                <p className="font-montserrat font-medium text-[16px] text-grey-black leading-[1.2]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mascot Center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] z-20 pointer-events-none">
            <img src={mascotImg} alt="Gyros Heroes Logo" className="w-full h-full object-contain" />
          </div>

          {/* Right Cards */}
          <div className="flex flex-col gap-[30px] w-[600px] absolute right-0 top-1/2 -translate-y-1/2 z-0">
            {cards.slice(2).map((card, idx) => (
              <div key={idx} className="bg-hero-green rounded-[80px] py-[30px] pl-[260px] pr-[50px] flex flex-col gap-2 relative">
                <div className="flex items-center gap-[15px]">
                  <img src={card.icon} alt="" className="size-[50px]" />
                  <h3 className="font-montserrat font-black text-[28px] text-white leading-tight transform -rotate-[0.12deg]">{card.title}</h3>
                </div>
                <p className="font-montserrat font-medium text-[16px] text-grey-black leading-[1.2]">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="xl:hidden flex flex-col items-center gap-0">
           {/* Mascot Top */}
           <div className="size-[300px] md:size-[400px] z-0 relative">
             <img src={mascotImg} alt="Gyros Heroes Logo" className="w-full h-full object-contain" />
           </div>

           {/* Cards Stack */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-[500px] md:max-w-[800px] -mt-[38px] z-10 relative">
             {cards.map((card, idx) => (
                <div key={idx} className="bg-hero-green rounded-[40px] p-[20px] flex flex-col gap-3 shadow-lg h-full">
                  <div className="flex items-center gap-3">
                    <img src={card.icon} alt="" className="size-10" />
                    <h3 className="font-montserrat font-black text-[24px] md:text-[28px] text-white leading-tight">{card.title}</h3>
                  </div>
                  <p className="font-montserrat font-medium text-[15px] md:text-[16px] text-grey-black leading-tight">
                    {card.description}
                  </p>
                </div>
             ))}
           </div>
        </div>

      </div>
    </section>
  );
};

export default AboutUs;