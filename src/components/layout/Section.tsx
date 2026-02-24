import React from 'react';

interface SectionProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  backgroundSlot?: React.ReactNode;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ 
  id, 
  className = '', 
  containerClassName = '', 
  backgroundSlot, 
  children 
}) => {
  return (
    <section 
      id={id} 
      className={`relative overflow-hidden ${className}`}
    >
      {backgroundSlot}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
};
