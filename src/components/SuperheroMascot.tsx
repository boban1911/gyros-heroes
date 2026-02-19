import React from 'react';
import superheroTortilla from '../assets/superhero-tortilla.svg';

const SuperheroMascot: React.FC = () => {
  return (
    <div 
      className="absolute left-4 md:left-10 lg:left-20 bottom-[-50px] md:bottom-[-100px] z-10 hidden md:block w-32 md:w-48 lg:w-64"
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
