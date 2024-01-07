import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
import {HeroSection} from "./components/hero-section/hero-section";
import {PricingCard} from "./components/pricing-card/pricing-card";
import {PricingSection} from "./components/pricing-section/pricing-section";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={
              <div>
                  <NavigationBar />
                  <HeroSection />
                  <PricingSection />
              </div>
          } />
          <Route path="/about" element={<> </>} />
        </Routes>
      </Router>
  );
}

export default App;
