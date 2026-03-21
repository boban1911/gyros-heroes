import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Pozivnica from './pages/Pozivnica';
import CookieBanner from './components/CookieBanner';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pozivnica" element={<Pozivnica />} />
        </Routes>
      </Router>
      <CookieBanner />
    </>
  );
}

export default App;