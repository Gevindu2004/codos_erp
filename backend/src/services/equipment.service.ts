import { db, storage } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Equipment, MaintenanceLog } from '../models/Equipment';

// --- EQUIPMENT ---

export const getEquipment = async (): Promise<Equipment[]> => {
  const equipmentCol = collection(db, 'equipment');
  const q = query(equipmentCol, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
};

export const getEquipmentById = async (id: string): Promise<Equipment | null> => {
  const docRef = doc(db, 'equipment', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Equipment;
  }
  return null;
};

export const addEquipment = async (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const equipmentCol = collection(db, 'equipment');
  const docRef = await addDoc(equipmentCol, {
    ...equipment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateEquipment = async (id: string, equipment: Partial<Equipment>): Promise<void> => {
  const docRef = doc(db, 'equipment', id);
  await updateDoc(docRef, {
    ...equipment,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteEquipment = async (id: string): Promise<void> => {
  const docRef = doc(db, 'equipment', id);
  await deleteDoc(docRef);
};

export const uploadManual = async (equipmentId: string, file: File): Promise<string> => {
  const fileRef = ref(storage, `manuals/${equipmentId}/${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  
  // Update equipment record with new manual URL
  await updateEquipment(equipmentId, { manualUrl: downloadUrl });
  
  return downloadUrl;
};

// --- MAINTENANCE LOGS ---

export const getMaintenanceLogs = async (equipmentId: string): Promise<MaintenanceLog[]> => {
  const logsCol = collection(db, `equipment/${equipmentId}/maintenance_logs`);
  const q = query(logsCol, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceLog));
};

export const addMaintenanceLog = async (equipmentId: string, log: Omit<MaintenanceLog, 'id' | 'equipmentId'>): Promise<string> => {
  const logsCol = collection(db, `equipment/${equipmentId}/maintenance_logs`);
  const docRef = await addDoc(logsCol, {
    ...log,
    equipmentId,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const deleteMaintenanceLog = async (equipmentId: string, logId: string): Promise<void> => {
  const docRef = doc(db, `equipment/${equipmentId}/maintenance_logs`, logId);
  await deleteDoc(docRef);
};
