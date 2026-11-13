import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  idToken: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getFreshToken: () => Promise<string | null>;
}

// Keep token strictly in memory (never in localStorage)
let inMemoryIdToken: string | null = null;

export function getInMemoryAuthToken(): string | null {
  return inMemoryIdToken;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  idToken: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  getFreshToken: async () => null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          inMemoryIdToken = token;
          setIdToken(token);
        } catch {
          inMemoryIdToken = null;
          setIdToken(null);
        }
      } else {
        inMemoryIdToken = null;
        setIdToken(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleAuthProvider);
    const token = await cred.user.getIdToken();
    inMemoryIdToken = token;
    setIdToken(token);
  };

  const logout = async () => {
    await signOut(auth);
    inMemoryIdToken = null;
    setIdToken(null);
  };

  const getFreshToken = async () => {
    if (!auth.currentUser) return null;
    const token = await auth.currentUser.getIdToken();
    inMemoryIdToken = token;
    setIdToken(token);
    return token;
  };

  return (
    <AuthContext.Provider
      value={{ user, idToken, loading, signInWithGoogle, logout, getFreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
