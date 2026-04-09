import React from 'react';

const SEOContent: React.FC = () => {
  return (
    <section className="w-full px-6 py-12 flex justify-center bg-transparent relative z-10">
      <div className="max-w-[800px] text-center">
        <h2 className="sr-only">O nama i našem girosu</h2>
        <p className="font-montserrat text-white opacity-40 text-[12px] md:text-[14px] leading-relaxed">
          Tražite <strong className="font-normal">najbolji giros</strong> u gradu? Gyros Heroes nudi autentično iskustvo i vrhunski ukus. 
          Bilo da vas zanima <strong className="font-normal">giros Novi Sad</strong> ili omiljeni <strong className="font-normal">giros Niš</strong>, 
          tu smo da vam pružimo najbolju uslugu. Svaki <strong className="font-normal">gyros</strong> pripremamo po 
          originalnoj recepturi koristeći uvek sveže sastojake, hrskav pomfrit i prepoznatljive soseve. 
          Otkrijte zašto smo prvi izbor za istinske ljubitelje grčke hrane!
        </p>
      </div>
    </section>
  );
};

export default SEOContent;
