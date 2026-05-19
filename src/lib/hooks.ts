import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { getFirebase } from './firebase';
import { Archive, ArchiveType } from '../types';

export function useArchives(type?: ArchiveType) {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initDocs = async () => {
      const { db } = await getFirebase();
      if (!db) {
        setLoading(false);
        return;
      }

      const archiveRef = collection(db, 'archives');
      let q = query(archiveRef, orderBy('createdAt', 'desc'));
      
      if (type) {
        q = query(archiveRef, where('type', '==', type), orderBy('createdAt', 'desc'));
      }

      unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Archive[];
          setArchives(items);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore Error:", err);
          setError(err.message);
          setLoading(false);
        }
      );
    };

    initDocs();
    return () => unsubscribe?.();
  }, [type]);

  const addArchive = async (data: any) => {
    const { db, auth } = await getFirebase();
    if (!db) throw new Error("Database not initialized");
    return addDoc(collection(db, 'archives'), {
      ...data,
      status: 'Available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth?.currentUser?.uid || 'anonymous'
    });
  };

  const updateArchive = async (id: string, data: any) => {
    const { db } = await getFirebase();
    if (!db) throw new Error("Database not initialized");
    const arcRef = doc(db, 'archives', id);
    return updateDoc(arcRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const removeArchive = async (id: string) => {
    const { db } = await getFirebase();
    if (!db) throw new Error("Database not initialized");
    const arcRef = doc(db, 'archives', id);
    return deleteDoc(arcRef);
  };

  return { archives, loading, error, addArchive, updateArchive, removeArchive };
}
