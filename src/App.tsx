import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import VideoSection from './components/VideoSection';
import Menu from './components/Menu';
import LocationsGallery from './components/LocationsGallery';
import Testimonials from './components/Testimonials';
import JoinUs from './components/JoinUs';
import OrderHero from './components/OrderHero';
import sunBg from './assets/sun.webp';

import Footer from './components/Footer';

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

        <div className="relative z-30">
          <div className="absolute top-0 left-0 w-full -translate-y-1/2">
            <VideoSection />
          </div>
        </div>

        <Menu />

        <LocationsGallery />

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-0">
            <img 
              src={sunBg} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          <JoinUs />
          <Testimonials />
          <OrderHero />
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default App;