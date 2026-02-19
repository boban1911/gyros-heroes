import React from 'react';
import superheroTortilla from '../assets/superhero-tortilla.svg';

const SuperheroMascot: React.FC = () => {
  return (
    <div 
      className="absolute left-4 xl:left-[20px] bottom-[-80px] xl:bottom-[-130px] z-10 hidden xl:block w-40 xl:w-[380px]"
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
