import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gallery1 from '../assets/gallery/gallery-1.webp';
import gallery2 from '../assets/gallery/gallery-2.webp';
import gallery3 from '../assets/gallery/gallery-3.webp';
import gallery4 from '../assets/gallery/gallery-4.webp';

const images = [
  { src: gallery1, type: 'small' },
  { src: gallery2, type: 'large' },
  { src: gallery3, type: 'small' },
  { src: gallery4, type: 'small' },
  { src: gallery1, type: 'small' },
  { src: gallery2, type: 'large' },
  { src: gallery3, type: 'small' },
  { src: gallery4, type: 'small' },
];

export default function GallerySlider() {
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
      {/* Slider Viewport - Handle its own overflow */}
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Negative margin to align first slide's padding with the parent container's left padding */}
        <div className="flex items-end -ml-4 md:-ml-8">
          {images.map((img, index) => {
            const isLarge = img.type === 'large';
            
            return (
              <div 
                key={index} 
                className={`
                  relative min-w-0 pl-4 md:pl-8
                  /* Mobile: Wide cards for swiping */
                  flex-[0_0_85%]
                  /* Tablet/Desktop: Variable widths based on type */
                  ${isLarge ? 'md:flex-[0_0_65%] lg:flex-[0_0_45%]' : 'md:flex-[0_0_55%] lg:flex-[0_0_35%]'}
                `}
              >
                <div className={`
                  relative overflow-hidden rounded-[40px] md:rounded-[80px]
                  /* Heights based on type */
                  ${isLarge ? 'h-[350px] md:h-[500px]' : 'h-[300px] md:h-[444px]'}
                  w-full
                `}>
                  <img 
                    src={img.src} 
                    alt={`Gallery image ${index + 1}`} 
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  {/* Bottom Gradient Overlay - Smoother Transition */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-hero-blue-dark/90 via-hero-blue-dark/40 to-transparent backdrop-blur-[1px]" />
                </div>
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
