import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import FirebaseFirestoreService from '../services/database/strategies/FirebaseFirestoreService';
import { useAuth } from '../contexts/Authentication';

const TiktokAuthenticated = () => {
  const [searchParams] = useSearchParams();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const {authState} = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const scopes = searchParams.get('scopes');
    const storedState = localStorage.getItem('tiktok_csrf_state');

    // Decode the code parameter if it's encoded
    const decodedCode = code ? decodeURIComponent(code) : null;

    if (decodedCode && state === storedState) {
      setIsSuccess(true);
      localStorage.removeItem('tiktok_csrf_state');
      console.log('Authentication successful');
      console.log('Code:', decodedCode);
      console.log('Scopes:', scopes);
      setCode(decodedCode);
    } else {
      setError('Authentication failed. Please try again.');
      console.error('Authentication failed');
      console.error('Received state:', state);
      console.error('Stored state:', storedState);
    }
  }, [searchParams]);

  const handleConfirm = () => {
    alert('TikTok integration successful!');
    if (code && authState.user! && authState.user.uid) {
      FirebaseFirestoreService.updateDocument(
        'users', 
        authState.user.uid, 
        { 
          tiktokConnected: true,
          tiktokAccessCode: code,
          tiktokLastAccessed: new Date(),
        },
        () => {
          window.location.href = '/dashboard';
        },
        () => {
          setError('Unable to update TikTok access code... Contact support.');
        }
      )
    } else {
      setError("Unable to update TikTok access code... Make sure you're on the same browser as you used to authenticate.");
    }
    
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 text-white  rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">TikTok Authentication</h1>
      {isSuccess ? (
        <>
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your TikTok account has been successfully linked!</AlertDescription>
          </Alert>
          <Button onClick={handleConfirm} className="w-full">
            Confirm Integration
          </Button>
          <p className="mt-4 text-sm text-gray-600">
            Your user profile has been updated to reflect the TikTok integration.
          </p>
        </>
      ) : error ? (
        <div className="flex flex-col items-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <a href="/dashboard" className="mt-4 text-accent hover:text-primary underline">Return to Dashboard</a>
        </div>
      ) : (
        <p>Verifying your TikTok authentication...</p>
      )}
    </div>
  );
};

export default TiktokAuthenticated;