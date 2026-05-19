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
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';
import { handleFirestoreError, OperationType } from './error-handler';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setCurrentUser({ ...userSnap.data(), uid: firebaseUser.uid } as User);
          } else {
            // Check for pre-created profile by email or prefix
            const emailPrefix = (firebaseUser.email || '').split('@')[0];
            const sanitizedPrefix = emailPrefix.replace(/[^a-zA-Z0-9]/g, '_');
            const preProfileRef = doc(db, 'users', sanitizedPrefix);
            const preProfileSnap = await getDoc(preProfileRef);

            if (preProfileSnap.exists()) {
              // Claim the profile: Copy it to UID document and delete temp document
              const { tempPassword, ...profileData } = preProfileSnap.data() as any;
              const newUser = {
                ...profileData,
                uid: firebaseUser.uid,
                email: firebaseUser.email || profileData.email,
                displayName: firebaseUser.displayName || profileData.displayName || 'User',
              } as User;

              await setDoc(userRef, {
                ...newUser,
                updatedAt: serverTimestamp(),
              });
              await deleteDoc(preProfileRef);
              setCurrentUser(newUser);
            } else {
              // Special Case for requested Super Admin
              const isRequestAdmin = firebaseUser.email === 'admin@bpn.go.id' || firebaseUser.email === 'admin';
              
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
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (!auth) return;
    return signOut(auth);
  };

  return { currentUser, loading, login, logout };
}
