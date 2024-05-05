import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
import {ModelReview} from "./pages/ModelReview";
import LandingPage from "./pages/LandingPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import AuthenticationPage from "./pages/AuthenticationPage";
import {VideoProgress} from "./pages/VideoProgress";
import {VideoSegments} from "./pages/VideoSegments";
import {SegmentationHandlingPage} from "./pages/SegmentationHandlingPage";
import {VideoMatchingPage} from "./pages/VideoMatchingPage";
import {NotFound} from "./pages/NotFound";
import {Settings} from "./pages/Settings";
import {SegmentVideoMatching} from "./components/segment-video-matching/SegmentVideoMatching";


function App() {
  return (
      <Router>
        <Routes>
          {/* Basic Pages */}
          <Route path="/" element={
              <LandingPage />
          } />

          {/* User Pages */}
          <Route path={"/authenticate"} element={<AuthenticationPage />} />
          <Route path={"/settings"} element={<Settings />} />

          {/* Self Supervised Learning */}
          <Route path={"/segmentation"} element={<SegmentationHandlingPage />} />
          <Route path={"/video-matching"} element={<VideoMatchingPage />}/>
          <Route path="/model-review" element={<div>
            <NavigationBar />
            <SegmentVideoMatching />
            {/*<ModelReview />*/}
          </div>} />

          {/* Main Pages */}
          <Route path={"/playground"} element={<PlaygroundPage />} />
          <Route path={"/video-handler"} element={<VideoProgress />} />
          <Route path={"/video-temporal-segmentation"} element={<VideoSegments />} />

          <Route path={"*"} element={<NotFound />} />
        </Routes>
      </Router>
  );
}

export default App;
