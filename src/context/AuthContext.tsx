import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  sendLoginEmail: (email: string) => Promise<void>;
  signInWithLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Email Link 認証のセットアップ
  const sendLoginEmail = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);
  };

  const signInWithLink = async (email: string) => {
    await signInWithEmailLink(auth, email, window.location.href);
    window.localStorage.removeItem('emailForSignIn');
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  // ユーザーデータの取得
  const fetchUserData = async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      setUserData(userSnap.data() as User);
    } else {
      // 新規ユーザーの場合は初期データを作成
      const initialUserData: User = {
        uid,
        displayName: currentUser?.displayName || '',
        email: currentUser?.email || '',
        photoURL: currentUser?.photoURL,
        tokenBalance: 200, // β版初期付与
        betaGrantedAt: serverTimestamp() as any,
        lastTokenUpdateAt: serverTimestamp() as any,
        createdAt: serverTimestamp() as any,
      };
      await setDoc(userRef, initialUserData);
      setUserData(initialUserData);
    }
  };

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    sendLoginEmail,
    signInWithLink,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

