import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
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
  // Use 'start' alignment for consistent layout, or 'center' if we want the middle card strictly centered.
  // The "jumping" often comes from inconsistent slide sizes or alignment + loop.
  // Since we have exactly 3 items and maybe show 3 on desktop, looping might be redundant or jumpy if not enough slides.
  // Embla docs say: "Loop: true requires at least as many slides as per view + 1 usually".
  // If we have 3 slides and show 3, loop can be tricky.
  // Let's duplicate the slides if we want a smooth infinite loop effect, OR just disable loop if we fit all content.
  // But the design implies a carousel.
  // Let's double the slides to 6 to make the loop smoother.
  
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: 'start', // 'start' usually behaves better for equal-width grids
    breakpoints: {
      '(min-width: 1024px)': { align: 'start' }
    }
  });

  return (
    <div className="overflow-hidden py-12" ref={emblaRef}>
      <div className="flex -ml-4 items-start">
        {duplicatedTestimonials.map((t, i) => {
          // Staggered layout logic needs to adapt to index % 3
          // Original: 0->Down, 1->Up, 2->Down
          // Pattern repeats: 0, 1, 2, 0, 1, 2...
          // So modulo 3: 
          // 0 -> Down
          // 1 -> Up
          // 2 -> Down
          
          const modIndex = i % 3;
          const isCenter = modIndex === 1;
          const marginTopClass = isCenter ? 'mt-0' : 'mt-12 md:mt-16'; 
          
          return (
            <div 
              key={i} 
              className={`flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 min-w-0 transition-all duration-300 ${marginTopClass}`}
            >
              <TestimonialCard {...t} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
