
import logoPart1 from '../assets/logo-part-1.svg';
import logoPart2 from '../assets/logo-part-2.svg';
import logoPart3 from '../assets/logo-part-3.svg';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Base Layer */}
      <img src={logoPart3} alt="Gyros Heroes Logo" className="absolute inset-0 w-full h-full object-contain" />
      
      {/* Layer 1 - Gyros text part? */}
      <div className="absolute top-[17.28%] left-[2.75%] bottom-[15.58%] right-[55.66%]">
         <img src={logoPart1} alt="" className="w-full h-full object-contain" />
      </div>

      {/* Layer 2 - Heroes text part? */}
      <div className="absolute top-[16.5%] left-[45.87%] bottom-[15.68%] right-[2.82%]">
         <img src={logoPart2} alt="" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}
