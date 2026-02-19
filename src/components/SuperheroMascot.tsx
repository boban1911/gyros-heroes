import React from 'react';
import superheroTortilla from '../assets/superhero-tortilla.svg';

const SuperheroMascot: React.FC = () => {
  return (
    <div 
      className="absolute left-4 md:left-10 lg:left-[20px] bottom-[-80px] md:bottom-[-120px] lg:bottom-[-180px] z-10 hidden md:block w-40 md:w-56 lg:w-[350px]"
      data-testid="superhero-mascot"
    >
      <img 
        src={superheroTortilla} 
        alt="Superhero tortilla character mascot" 
        className="w-full h-auto drop-shadow-2xl"
        style={{ transform: 'rotate(19.22deg)' }}
      />
    </div>
  );
};

export default SuperheroMascot;
