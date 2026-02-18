import React from 'react';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      
      {/* 
        Padding top logic:
        Top Banner: ~40px height + 10px top padding = 50px
        Nav: ~60px height + 10px margin top = 70px
        Total occupied at top: ~120px + visual space
        Let's give it 140px
      */}
      <main className="pt-[140px]">
        
        <section id="hero" className="min-h-screen flex items-center justify-center bg-gray-100 border-b border-gray-200">
          <h1 className="text-4xl font-bold font-montserrat text-hero-blue">Hero Section</h1>
        </section>

        <section id="o-nama" className="min-h-screen flex items-center justify-center bg-gray-50 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">O nama</h2>
        </section>

        <section id="meni" className="min-h-screen flex items-center justify-center bg-gray-100 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Meni</h2>
        </section>

        <section id="lokacije" className="min-h-screen flex items-center justify-center bg-gray-50 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Lokacije</h2>
        </section>

        <section id="posao" className="min-h-screen flex items-center justify-center bg-gray-100 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Posao</h2>
        </section>

        <section id="testimonijali" className="min-h-screen flex items-center justify-center bg-gray-50 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Testimonijali</h2>
        </section>

      </main>
    </div>
  );
}

export default App;