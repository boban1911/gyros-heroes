import React from 'react';

export interface TestimonialCardProps {
  author: string;
  quote: string;
  color: 'yellow' | 'green' | 'blue';
}

export default function TestimonialCard({ author, quote, color }: TestimonialCardProps) {
  const bgClass = {
    yellow: 'bg-hero-yellow',
    green: 'bg-hero-green',
    blue: 'bg-hero-blue-dark'
  }[color];

  return (
    // Updated classes:
    // - aspect-square: To force a square-ish shape.
    // - h-full: Fill the container.
    // - justify-center: Center content vertically.
    // - w-full: Fill container width.
    <div className={`p-8 md:p-12 rounded-[40px] md:rounded-[80px] ${bgClass} text-white flex flex-col items-center justify-center text-center gap-8 shadow-lg h-full aspect-square w-full`}>
      <p className="font-montserrat font-normal text-xl md:text-2xl lg:text-[32px] leading-relaxed">"{quote}"</p>
      <p className="font-montserrat font-bold uppercase text-lg md:text-2xl tracking-wide">— {author}</p>
    </div>
  );
}