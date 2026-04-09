import React, { lazy, Suspense } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import sunBg from '../assets/sun.webp';

// Lazy loading components below the fold
const Menu = lazy(() => import('../components/Menu'));
const LocationsGallery = lazy(() => import('../components/LocationsGallery'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const JoinUs = lazy(() => import('../components/JoinUs'));
const OrderHero = lazy(() => import('../components/OrderHero'));
const SEOContent = lazy(() => import('../components/SEOContent'));
const Footer = lazy(() => import('../components/Footer'));

// Simple fallback component
const SectionSkeleton = () => <div className="min-h-[200px] w-full bg-hero-blue/10 animate-pulse" />;

const Home: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-hero-blue">
      <Navbar />
      
      <main className="pt-0">
        <Hero />
        <AboutUs />

        <Suspense fallback={<SectionSkeleton />}>
          <Menu />
          <LocationsGallery />
          <JoinUs />

          <div className="relative">
            <div className="absolute top-[-50px] left-0 right-0 bottom-0 pointer-events-none z-0 overflow-hidden">
              <img 
                src={sunBg} 
                alt="" 
                className="w-full h-full object-cover"
              />
            </div>
            <Testimonials />
            <OrderHero />
            <SEOContent />
          </div>
        </Suspense>
      </main>

      <Suspense fallback={<div className="h-64 bg-hero-blue-dark" />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Home;
