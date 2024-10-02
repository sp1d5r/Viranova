import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/Authentication";
import FirebaseFirestoreService from "../services/database/strategies/FirebaseFirestoreService";

export const OnboardingCancel: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCancellation = async () => {
      if (!authState.user?.uid) {
        console.error("No user ID found for deletion");
        return;
      }

      try {
        // Delete the user document from Firestore
        await FirebaseFirestoreService.deleteDocument("users", authState.user.uid);

        // Redirect to the home page
        navigate('/');
      } catch (error) {
        console.error("Error deleting user:", error);
        navigate('/');
      }
    };

    handleCancellation();
  }, [authState, navigate]);

  return (
    <div>
      <h1>Cancelling your subscription...</h1>
      <p>We're sorry to see you go. Redirecting you to the home page...</p>
    </div>
  );
};