import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';

function App() {
  return (
    <div className="relative min-h-screen bg-white">
      <Navbar />
      
      {/* 
        Padding top logic:
        Nav: ~60px height + 10px margin top + 10px sticky top = 80px
        Let's give it 90px
      */}
      <main className="pt-[90px]">
        
        <Hero />

        <section id="o-nama" className="py-20 flex items-center justify-center bg-gray-50 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">O nama</h2>
        </section>

        <section id="meni" className="py-20 flex items-center justify-center bg-gray-100 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Meni</h2>
        </section>

        <section id="lokacije" className="py-20 flex items-center justify-center bg-gray-50 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Lokacije</h2>
        </section>

        <section id="posao" className="py-20 flex items-center justify-center bg-gray-100 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Posao</h2>
        </section>

        <section id="testimonijali" className="py-20 flex items-center justify-center bg-gray-50 border-b border-gray-200">
          <h2 className="text-3xl font-bold font-montserrat text-hero-blue">Testimonijali</h2>
        </section>

      </main>
    </div>
  );
}

export default App;