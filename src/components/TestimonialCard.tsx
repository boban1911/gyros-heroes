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
    <div className={`p-6 md:p-8 lg:p-6 xl:p-10 rounded-[40px] md:rounded-[80px] ${bgClass} text-white flex flex-col items-center justify-center text-center gap-4 md:gap-6 lg:gap-4 xl:gap-8 shadow-lg h-full aspect-square w-full overflow-hidden`}>
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        {/* Adjusted mobile font size to text-lg (was text-base) to fill the card better */}
        <p className="font-montserrat font-normal text-lg md:text-xl lg:text-base xl:text-xl 2xl:text-2xl leading-relaxed line-clamp-[8] md:line-clamp-none">
          "{quote}"
        </p>
      </div>
      {/* Adjusted mobile author font size to text-base (was text-sm) */}
      <p className="font-montserrat font-bold uppercase text-base md:text-lg lg:text-sm xl:text-lg 2xl:text-xl tracking-wide shrink-0 pb-2 md:pb-0">— {author}</p>
    </div>
  );
}
