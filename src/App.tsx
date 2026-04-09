import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CookieBanner from './components/CookieBanner';
import AnalyticsTracker from './components/AnalyticsTracker';

function App() {
  return (
    <>
      <Router>
        <AnalyticsTracker />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
      <CookieBanner />
    </>
  );
}

export default App;