import React from 'react';

export interface TestimonialCardProps {
  author: string;
  quote: string;
  color: 'yellow' | 'green' | 'blue';
}

export default function TestimonialCard({ author, quote, color }: TestimonialCardProps) {
  // Map prop colors to Tailwind classes (placeholder logic for now)
  const bgClass = {
    yellow: 'bg-hero-yellow',
    green: 'bg-hero-green',
    blue: 'bg-hero-blue-dark'
  }[color];

  return (
    <div className={`p-8 rounded-[40px] md:rounded-[80px] ${bgClass} text-white flex flex-col items-center text-center gap-6 shadow-lg h-full`}>
      <p className="font-montserrat text-lg md:text-xl leading-relaxed">"{quote}"</p>
      <p className="font-montserrat font-bold uppercase text-base md:text-lg">— {author}</p>
    </div>
  );
}
