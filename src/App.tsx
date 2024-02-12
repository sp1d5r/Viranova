import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
import {ModelReview} from "./pages/ModelReview";
import LandingPage from "./pages/LandingPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import AuthenticationPage from "./pages/AuthenticationPage";
import {VideoProgress} from "./pages/VideoProgress";


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={
              <LandingPage />
          } />
        <Route path={"/playground"} element={<PlaygroundPage />} />
        <Route path={"/authenticate"} element={<AuthenticationPage />} />

          <Route path="/model-review" element={<div>
              <NavigationBar />
              <ModelReview />
          </div>} />

        <Route path={"/video-handler"} element={<VideoProgress />} />
        </Routes>
      </Router>
  );
}

export default App;
