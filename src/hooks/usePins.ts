import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Pin, PinType } from '../types';
import { useAuth } from './useAuth';

export const usePins = () => {
  const { user } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPins([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'pins'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pinsData: Pin[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pin));
      setPins(pinsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pins:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addPin = async (pinData: Partial<Pin>) => {
    if (!user) return;
    
    return await addDoc(collection(db, 'pins'), {
      ...pinData,
      createdBy: user.uid,
      createdByName: user.displayName || 'Gezgin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const updatePin = async (id: string, pinData: Partial<Pin>) => {
    const pinRef = doc(db, 'pins', id);
    // Strip ID and other non-data fields before update
    const { id: _, createdAt: __, createdBy: ___, ...data } = pinData as any;
    return await updateDoc(pinRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  };

  const deletePin = async (id: string) => {
    return await deleteDoc(doc(db, 'pins', id));
  };

  return { pins, loading, addPin, updatePin, deletePin };
};
