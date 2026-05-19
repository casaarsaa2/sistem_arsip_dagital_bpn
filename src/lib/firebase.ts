import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

let firebaseApp: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Export a function to ensure initialization and return the instances
export async function getFirebase() {
  if (auth && db) return { auth, db };

  try {
    const response = await fetch('/firebase-applet-config.json');
    const config = await response.json();
    
    firebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');
    
    return { auth, db };
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Return empty/dummy or handle as needed
    return { auth: null, db: null };
  }
}

// Still export the variables for immediate (but potentially undefined) access
export { auth, db };


