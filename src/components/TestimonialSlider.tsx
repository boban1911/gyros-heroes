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
  // Use dragFree: true for natural scrolling flow (like GallerySlider)
  // Use containScroll: false to allow free movement
  // Use loop: true for infinite scroll
  
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
            // Stagger logic based on i % 3 to match design:
            // 0 (Yellow) -> Down
            // 1 (Green) -> Up
            // 2 (Blue) -> Down
            const modIndex = i % 3;
            const isCenter = modIndex === 1;
            const marginTopClass = isCenter ? 'mt-0' : 'mt-12 md:mt-16'; 
            
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
