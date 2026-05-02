import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CookieBanner from './components/CookieBanner';
import AnalyticsTracker from './components/AnalyticsTracker';

const Loyalty = lazy(() => import('./pages/Loyalty'));
const LoyaltyCard = lazy(() => import('./pages/LoyaltyCard'));

const RouteFallback: React.FC = () => (
  <div className="min-h-screen w-full bg-hero-blue" />
);

function App() {
  return (
    <>
      <Router>
        <AnalyticsTracker />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/loyalty/card" element={<LoyaltyCard />} />
          </Routes>
        </Suspense>
      </Router>
      <CookieBanner />
    </>
  );
}

export default App;
