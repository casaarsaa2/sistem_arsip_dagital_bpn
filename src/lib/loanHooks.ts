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
import { db } from './firebase';
import { Loan } from '../types';
import { handleFirestoreError, OperationType } from './error-handler';

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initLoans = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      const collectionPath = 'loans';
      const q = query(collection(db, collectionPath), orderBy('loanDate', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          loanDate: doc.data().loanDate?.toDate?.()?.toISOString() || new Date().toISOString()
        })) as Loan[];
        setLoans(items);
        setLoading(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, collectionPath);
        setLoading(false);
      });
    };

    initLoans();
    return () => unsubscribe?.();
  }, []);

  const createLoan = async (archiveId: string, borrowerName: string, notes?: string) => {
    if (!db) throw new Error("Database not initialized");
    
    const collectionPath = 'loans';
    try {
      const loanDoc = await addDoc(collection(db, collectionPath), {
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
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, collectionPath);
    }
  };

  const returnLoan = async (loanId: string, archiveId: string) => {
    if (!db) throw new Error("Database not initialized");
    
    try {
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
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `loans/${loanId}`);
    }
  };

  return { loans, loading, createLoan, returnLoan };
}
