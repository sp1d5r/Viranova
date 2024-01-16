import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
import {HeroSection} from "./components/hero-section/hero-section";
import {PricingCard} from "./components/pricing-card/pricing-card";
import {PricingSection} from "./components/pricing-section/pricing-section";
import {WhySection} from "./components/why-section/why-section";
import {NewEraSection} from "./components/new-era-section/new-era-section";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={
              <div>
                  <NavigationBar />
                  <HeroSection />
                  <WhySection />
                  <NewEraSection />
              </div>
          } />
          <Route path="/about" element={<> </>} />
        </Routes>
      </Router>
  );
}

export default App;
