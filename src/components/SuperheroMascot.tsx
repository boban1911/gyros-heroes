import React from 'react';
import superheroTortilla from '../assets/superhero-tortilla.svg';

const SuperheroMascot: React.FC = () => {
  return (
    <div 
      className="absolute left-4 md:left-10 lg:left-[20px] bottom-[-100px] md:bottom-[-150px] lg:bottom-[-200px] z-10 hidden md:block w-48 md:w-64 lg:w-[450px]"
      data-testid="superhero-mascot"
    >
      <img 
        src={superheroTortilla} 
        alt="Superhero tortilla character mascot" 
        className="w-full h-auto drop-shadow-2xl"
      />
    </div>
  );
};

export default SuperheroMascot;
