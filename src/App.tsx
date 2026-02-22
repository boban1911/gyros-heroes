import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Menu from './components/Menu';
import LocationsGallery from './components/LocationsGallery';
import Testimonials from './components/Testimonials';

function App() {
  return (
    <div className="relative min-h-screen bg-hero-blue">
      <Navbar />
      
      {/* 
        Padding top logic:
        Nav: ~60px height + 10px margin top + 10px sticky top = 80px
        Let's give it 90px
      */}
      <main className="pt-0">
        
        <Hero />

        <AboutUs />

        <Menu />

        <LocationsGallery />

        <section id="posao" className="py-20 flex items-center justify-center bg-hero-blue border-b border-white/10">
          <h2 className="text-3xl font-bold font-montserrat text-white">Posao</h2>
        </section>

        <Testimonials />

      </main>
    </div>
  );
}

export default App;