import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { getFirebase } from './firebase';
import { User } from '../types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const { auth, db } = await getFirebase();
      if (!auth || !db) {
        setLoading(false);
        return;
      }

      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setCurrentUser({ ...userSnap.data(), uid: firebaseUser.uid } as User);
          } else {
            // Special Case for requested Super Admin
            const isRequestAdmin = firebaseUser.email === 'admin@bpn.go.id';
            
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || (isRequestAdmin ? 'Super Admin' : 'User'),
              role: isRequestAdmin ? 'SUPER_ADMIN' : 'PETUGAS_ARSIP',
              isActive: true,
              createdAt: new Date().toISOString(),
            };
            
            await setDoc(userRef, {
              ...newUser,
              createdAt: serverTimestamp(),
            });
            setCurrentUser(newUser);
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
    };

    initAuth();
    return () => unsubscribe?.();
  }, []);

  const login = async (email: string, pass: string) => {
    const { auth } = await getFirebase();
    if (!auth) throw new Error("Firebase not initialized");
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    const { auth } = await getFirebase();
    if (!auth) return;
    return signOut(auth);
  };

  return { currentUser, loading, login, logout };
}
