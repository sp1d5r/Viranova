import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './Authentication';
import FirebaseFirestoreService from '../services/database/strategies/FirebaseFirestoreService';
import { User } from '../types/collections/User';

interface UserContextType {
  userData: User | null;
  loading: boolean;
  error: string | null;
  updateUserData: (data: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authState } = useAuth();

  useEffect(() => {
    if (authState.user?.uid) {
      FirebaseFirestoreService.getDocument('users',
        authState.user.uid,
        (user) => {
          setLoading(false);
        },
        (err) => {
          setLoading(false);
        })

      const unsubscribe = FirebaseFirestoreService.listenToDocument<User>(
        'users',
        authState.user.uid,
        (user) => {
          setUserData(user);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [authState.user?.uid, authState]);

  const updateUserData = async (data: Partial<User>) => {
    if (authState.user?.uid && userData) {
      try {
        await FirebaseFirestoreService.updateDocument('users', authState.user.uid, data);
        setUserData({ ...userData, ...data });
      } catch (err) {
        setError('Failed to update user data');
      }
    }
  };

  return (
    <UserContext.Provider value={{ userData, loading, error, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};