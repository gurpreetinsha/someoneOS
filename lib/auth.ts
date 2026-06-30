"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider 
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  signInMockUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
  signInMockUser: () => {},
});

export const signInWithGoogle = async (): Promise<void> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential && credential.accessToken) {
      sessionStorage.setItem("google_access_token", credential.accessToken);
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const signInMockUser = () => {
    setUser({
      uid: "hackathon-demo-user",
      displayName: "Hackathon Judge",
      email: "judge@someoneos.ai",
      photoURL: null,
    } as unknown as User);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (user?.uid === "hackathon-demo-user") return; // preserve mock session
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        loading,
        signInWithGoogle,
        signOutUser,
        signInMockUser,
      },
    },
    children
  );
};

export const useAuth = () => useContext(AuthContext);
