import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import Menu from './components/Menu';
import LocationsGallery from './components/LocationsGallery';
import Testimonials from './components/Testimonials';
import JoinUs from './components/JoinUs';

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

        <JoinUs />

        <Testimonials />

      </main>
    </div>
  );
}

export default App;