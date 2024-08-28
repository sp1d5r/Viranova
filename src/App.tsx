import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
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
import {Shorts} from "./pages/Shorts";
import TermsOfServicePages from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import Dashboard from "./pages/Dashboard";
import {Onboarding} from "./pages/Onboarding";
import {OnboardingSuccess} from "./pages/OnboardingSuccess";


function App() {
  return (
      <Router>
        <Routes>
          {/* Basic Pages */}
          <Route path="/" element={
              <LandingPage />
          } />

          {/* Static Pages */}
          <Route path="/terms-of-service" element={<TermsOfServicePages />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

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
          <Route path={"/dashboard"} element={<Dashboard />} />
          <Route path={"/video-handler"} element={<VideoProgress />} />
          <Route path={"/video-temporal-segmentation"} element={<VideoSegments />} />
          <Route path={"/shorts"} element={<Shorts />} />
          <Route path={"/onboarding"} element={<Onboarding />} />
          <Route path="/onboarding-success" element={<OnboardingSuccess />} />

          <Route path={"*"} element={<NotFound />} />
        </Routes>
      </Router>
  );
}

export default App;
