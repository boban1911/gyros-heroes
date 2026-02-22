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
    // - overflow-hidden: Ensure content doesn't spill out.
    // - max-w-full: Constrain width.
    <div className={`p-6 md:p-8 lg:p-12 rounded-[40px] md:rounded-[80px] ${bgClass} text-white flex flex-col items-center justify-center text-center gap-4 md:gap-8 shadow-lg h-full aspect-square w-full overflow-hidden`}>
      {/* Quote Container: flex-1 to take available space, overflow-y-auto to scroll if *really* long, but hidden scrollbar preferred */}
      <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
        <p className="font-montserrat font-normal text-lg md:text-xl lg:text-[28px] leading-relaxed line-clamp-[8] md:line-clamp-none">
          "{quote}"
        </p>
      </div>
      <p className="font-montserrat font-bold uppercase text-base md:text-xl lg:text-2xl tracking-wide shrink-0 pb-2 md:pb-0">— {author}</p>
    </div>
  );
}
