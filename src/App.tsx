import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {NavigationBar} from "./components/navigation-bar/navigation-bar";
import LandingPage from "./pages/LandingPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import AuthenticationPage from "./pages/AuthenticationPage";
import {VideoProgress} from "./pages/VideoProgress";
import {VideoSegments} from "./pages/VideoSegments";
import {NotFound} from "./pages/NotFound";
import {SettingsPage} from "./pages/Settings";
import {Shorts} from "./pages/Shorts";
import TermsOfServicePages from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import Dashboard from "./pages/Dashboard";
import {Onboarding} from "./pages/Onboarding";
import {OnboardingSuccess} from "./pages/OnboardingSuccess";
import WyrVideoPage from "./pages/WyrVideoPage";
import TiktokAuthenticated from './pages/TiktokAuthenticated';
import { OnboardingCancel } from './pages/OnboardingCancel';


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
          <Route path={"/settings"} element={<SettingsPage />} />

          {/* Main Pages */}
          <Route path={"/playground"} element={<PlaygroundPage />} />
          <Route path={"/dashboard"} element={<Dashboard />} />
          <Route path={"/video-handler"} element={<VideoProgress />} />
          <Route path={"/video-temporal-segmentation"} element={<VideoSegments />} />
          <Route path={"/shorts"} element={<Shorts />} />
          <Route path={"/onboarding"} element={<Onboarding />} />
          <Route path={"/onboarding-cancel"} element={<OnboardingCancel />} />
          <Route path="/onboarding-success" element={<OnboardingSuccess />} />
          <Route path="/wyr-videos/:id" element={<WyrVideoPage />} />

          {/* Tiktok */}
          <Route path="/dashbaord" element={<TiktokAuthenticated />} />


          <Route path={"*"} element={<NotFound />} />
        </Routes>
      </Router>
  );
}

export default App;
