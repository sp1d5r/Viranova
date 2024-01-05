import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
import {Logo} from "./components/logo/logo";
import {HeroSection} from "./components/hero-section/hero-section";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HeroSection/>} />
          <Route path="/about" element={<> </>} />
        </Routes>
      </Router>
  );
}

export default App;
