import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gallery1 from '../assets/gallery/gallery-1.webp';
import gallery2 from '../assets/gallery/gallery-2.webp';
import gallery3 from '../assets/gallery/gallery-3.webp';
import gallery4 from '../assets/gallery/gallery-4.webp';

const images = [gallery1, gallery2, gallery3, gallery4];

export default function GallerySlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    dragFree: true, 
    containScroll: false, // Must be false for loop to work correctly with variable widths sometimes, but 'trimSnaps' is usually fine. Let's try loop: true.
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
      {/* Slider Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 md:gap-8 px-4 md:px-0">
          {images.map((src, index) => (
            <div 
              key={index} 
              // Increased width: mobile 85%, tablet 60%, desktop 45%
              className="relative flex-[0_0_85%] md:flex-[0_0_60%] lg:flex-[0_0_45%] min-w-0"
            >
              <div className={`relative overflow-hidden rounded-[40px] md:rounded-[80px] h-[350px] md:h-[500px]`}>
                <img 
                  src={src} 
                  alt={`Gallery image ${index + 1}`} 
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10" />
                {/* Bottom Gradient Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-hero-blue/80 to-transparent backdrop-blur-[2px]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (Visible on Desktop) */}
      <button 
        onClick={scrollPrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 text-hero-blue"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>

      <button 
        onClick={scrollNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full items-center justify-center shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 text-hero-blue"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>
    </div>
  );
}