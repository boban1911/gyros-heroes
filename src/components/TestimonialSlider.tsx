import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TestimonialCard, { TestimonialCardProps } from './TestimonialCard';

const testimonials: TestimonialCardProps[] = [
  {
    author: 'Radoš',
    quote: 'Kao neko ko jede giros bar dva puta nedeljno, mogu da kažem da ste me kupili. Porcije su obilne, bez viška masnoće, a ukus isti svaki put.',
    color: 'yellow'
  },
  {
    author: 'Maša',
    quote: 'Došla sam slučajno i ostala prijatno iznenađena. Piletina perfektno pečena, začin odličan, ništa premasno, baš po ukusu odrađeno.',
    color: 'green'
  },
  {
    author: 'Vuk',
    quote: 'Poveo sam dete da proba vaš kids meni i sve je nestalo za pet minuta. Moj giros je bio isto odličan, Veliki svinjski - tzatiki luk - TOP!',
    color: 'blue'
  }
];

export default function TestimonialSlider() {
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    dragFree: true, 
    containScroll: false,
    align: 'start',
    loop: true
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative w-full group">
      <div className="overflow-hidden py-12" ref={emblaRef}>
        <div className="flex -ml-4 items-start">
          {duplicatedTestimonials.map((t, i) => {
            // Adjusted stagger logic:
            // 0 (Yellow) -> Down (Lowest) -> mt-12 md:mt-16
            // 1 (Green) -> Up (Highest) -> mt-0
            // 2 (Blue) -> Mid (Intermediate) -> mt-6 md:mt-8
            
            const modIndex = i % 3;
            let marginTopClass = 'mt-12 md:mt-16'; // Default lowest (Yellow)

            if (modIndex === 1) { // Green
              marginTopClass = 'mt-0';
            } else if (modIndex === 2) { // Blue
              marginTopClass = 'mt-6 md:mt-8';
            }
            
            return (
              <div 
                key={i} 
                className={`flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 min-w-0 ${marginTopClass}`}
              >
                <TestimonialCard {...t} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows (Visible on Desktop) */}
      <button 
        onClick={scrollPrev}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 text-hero-blue"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>

      <button 
        onClick={scrollNext}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 text-hero-blue"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}