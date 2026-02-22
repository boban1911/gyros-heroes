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
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex -ml-4">
        {testimonials.map((t, i) => (
          <div key={i} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] pl-4 min-w-0">
            <TestimonialCard {...t} />
          </div>
        ))}
      </div>
    </div>
  );
}
