import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { getFirebase } from './firebase';
import { Loan } from '../types';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initLoans = async () => {
      const { db } = await getFirebase();
      if (!db) {
        setLoading(false);
        return;
      }

      const q = query(collection(db, 'loans'), orderBy('loanDate', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loanDate: doc.data().loanDate?.toDate?.()?.toISOString() || new Date().toISOString()
        })) as Loan[];
        setLoans(items);
        setLoading(false);
      });
    };

    initLoans();
    return () => unsubscribe?.();
  }, []);

  const createLoan = async (archiveId: string, borrowerName: string, notes?: string) => {
    const { db } = await getFirebase();
    if (!db) throw new Error("Database not initialized");
    
    const loanDoc = await addDoc(collection(db, 'loans'), {
      archiveId,
      borrowerName,
      loanDate: serverTimestamp(),
      status: 'Active',
      notes: notes || ''
    });

    const archiveRef = doc(db, 'archives', archiveId);
    await updateDoc(archiveRef, {
      status: 'Borrowed',
      updatedAt: serverTimestamp()
    });

    return loanDoc;
  };

  const returnLoan = async (loanId: string, archiveId: string) => {
    const { db } = await getFirebase();
    if (!db) throw new Error("Database not initialized");
    
    const loanRef = doc(db, 'loans', loanId);
    await updateDoc(loanRef, {
      status: 'Returned',
      actualReturnDate: serverTimestamp()
    });

    const archiveRef = doc(db, 'archives', archiveId);
    await updateDoc(archiveRef, {
      status: 'Available',
      updatedAt: serverTimestamp()
    });
  };

  return { loans, loading, createLoan, returnLoan };
}
