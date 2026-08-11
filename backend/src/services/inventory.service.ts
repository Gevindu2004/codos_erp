import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Inventory } from '../models/Inventory';

const COLLECTION_NAME = 'inventory';

export const getInventoryItems = async (): Promise<Inventory[]> => {
  const invCol = collection(db, COLLECTION_NAME);
  const q = query(invCol, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inventory));
};

export const getInventoryItemById = async (id: string): Promise<Inventory | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Inventory;
  }
  return null;
};

export const addInventoryItem = async (item: Omit<Inventory, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const invCol = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(invCol, {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateInventoryItem = async (id: string, updates: Partial<Inventory>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
