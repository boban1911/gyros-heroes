import React from 'react';
import iconPlay from '../assets/icon-play.svg';

const VideoSection: React.FC = () => {
  return (
    <section id="video-section" className="w-full flex justify-center px-4 z-30 relative pointer-events-none">
      <div 
        className="w-full max-w-[1240px] h-[300px] md:h-[600px] bg-grey-black rounded-[40px] md:rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg group cursor-pointer transition-transform hover:scale-[1.01] pointer-events-auto"
        aria-label="Promotional Video Placeholder"
      >
        {/* Play Button Container */}
        <div className="relative size-16 md:size-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <img src={iconPlay} alt="Play Video" className="w-full h-full" />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
