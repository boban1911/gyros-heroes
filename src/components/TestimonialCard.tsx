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
    <div className={`p-6 md:p-8 lg:p-10 xl:p-12 rounded-[40px] md:rounded-[80px] ${bgClass} text-white flex flex-col items-center justify-center text-center gap-4 md:gap-6 lg:gap-8 shadow-lg h-full aspect-square w-full overflow-hidden`}>
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        {/* Further reduced font sizes for better responsiveness */}
        {/* Old: text-base md:text-lg lg:text-2xl xl:text-[28px] */}
        {/* New: text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-[28px] */}
        <p className="font-montserrat font-normal text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-[28px] leading-relaxed line-clamp-[8] md:line-clamp-none">
          "{quote}"
        </p>
      </div>
      {/* Reduced Author font sizes */}
      <p className="font-montserrat font-bold uppercase text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl tracking-wide shrink-0 pb-2 md:pb-0">— {author}</p>
    </div>
  );
}
