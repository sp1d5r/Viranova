import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
import {Logo} from "./components/logo/logo";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<NavigationBar />} />
          <Route path="/about" element={<> </>} />
        </Routes>
      </Router>
  );
}

export default App;
