import React from 'react';
import TestimonialSlider from './TestimonialSlider';

export default function Testimonials() {
  return (
    <section id="testimonijali" className="py-20 relative z-10">
      <div className="container mx-auto px-4 max-w-[1440px]">
        <div className="text-center mb-16">
          <h2 className="font-montserrat font-bold text-4xl md:text-6xl text-white">
            Šta naši <span className="font-montserrat italic text-hero-yellow">gosti</span> kažu
          </h2>
        </div>
        <TestimonialSlider />
      </div>
    </section>
  );
}
