import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/tailwind.css';
import './styles/container.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {NotificationProvider} from "./contexts/NotificationProvider";
import {AuthProvider} from "./contexts/Authentication";
import { PostHogProvider} from 'posthog-js/react'
import {Toaster} from "./components/ui/toaster";
import {UserProvider} from "./contexts/UserProvider";
import {BrowserNotificationProvider} from "./contexts/BrowserNotificationProvider";
import { DarkModeProvider } from './contexts/DarkModeProvider';

const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <AuthProvider>
        <UserProvider>
          <NotificationProvider>
            <BrowserNotificationProvider>
              <DarkModeProvider>
                <App />
              </DarkModeProvider>  
              <Toaster />
            </BrowserNotificationProvider>
          </NotificationProvider>
        </UserProvider>
      </AuthProvider>
    </PostHogProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
