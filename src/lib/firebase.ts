import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Export a function to ensure initialization and return the instances
export async function getFirebase() {
  if (auth && db) return { auth, db };

  try {
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp, (config as any).firestoreDatabaseId || '(default)');
    
    return { auth, db };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return { auth: null, db: null };
  }
}

// Still export the variables for immediate (but potentially undefined) access
export { auth, db };


