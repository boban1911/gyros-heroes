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
  // Use 'center' alignment so the middle card is actually centered if there are 3 cards visible
  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: 'center', // Center alignment for the prominent middle card
    breakpoints: {
      '(min-width: 1024px)': { align: 'start' } // On desktop, we want to align start but control layout via margins manually if we show all 3
    }
  });

  return (
    <div className="overflow-hidden py-12" ref={emblaRef}> {/* Added py-12 to allow space for transform/margins */}
      <div className="flex -ml-4 items-start"> {/* items-start to allow margin-top to push down */}
        {testimonials.map((t, i) => {
          // Logic for staggered layout:
          // Center card (index 1) is "up" (no margin top).
          // Side cards (index 0 and 2) are "down" (margin top).
          // This applies mostly to desktop/tablet where multiple cards are visible.
          // On mobile (stack/single view), this might look weird if we enforce it strictly, 
          // but let's try to match the desktop design first.
          
          // Let's assume on desktop we see all 3.
          // Index 1 is the "center" visually.
          const isCenter = i === 1;
          const marginTopClass = isCenter ? 'mt-0' : 'mt-12 md:mt-16'; // Push side cards down
          
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