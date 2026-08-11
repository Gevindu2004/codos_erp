import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    return auth.signOut();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Inactivity Auto-Logout Timer (1 hour)
  useEffect(() => {
    if (!currentUser) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    
    // 1 Hour in milliseconds
    const INACTIVITY_LIMIT = 60 * 60 * 1000; 

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("User inactive for 1 hour, logging out...");
        logout();
      }, INACTIVITY_LIMIT);
    };

    // Events to track activity
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    // Setup listeners
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Start initial timer
    resetTimer();

    // Cleanup listeners and timer on unmount or when user logs out
    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
