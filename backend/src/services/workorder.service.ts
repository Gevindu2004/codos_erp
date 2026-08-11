import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import type { WorkOrder, WorkOrderTask, WorkOrderPart, WorkOrderStatus } from '../models/WorkOrder';

// --- WORK ORDERS ---

export const getWorkOrders = async (statusFilter?: WorkOrderStatus): Promise<WorkOrder[]> => {
  const woCol = collection(db, 'work_orders');
  let q;
  if (statusFilter) {
    q = query(woCol, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
  } else {
    q = query(woCol, orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkOrder));
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  const docRef = doc(db, 'work_orders', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as WorkOrder;
  }
  return null;
};

export const addWorkOrder = async (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const woCol = collection(db, 'work_orders');
  const docRef = await addDoc(woCol, {
    ...workOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateWorkOrder = async (id: string, updates: Partial<WorkOrder>): Promise<void> => {
  const docRef = doc(db, 'work_orders', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteWorkOrder = async (id: string): Promise<void> => {
  const docRef = doc(db, 'work_orders', id);
  await deleteDoc(docRef);
};

// --- TASKS ---

export const getWorkOrderTasks = async (workOrderId: string): Promise<WorkOrderTask[]> => {
  const tasksCol = collection(db, `work_orders/${workOrderId}/tasks`);
  const q = query(tasksCol, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkOrderTask));
};

export const addWorkOrderTask = async (workOrderId: string, description: string): Promise<string> => {
  const tasksCol = collection(db, `work_orders/${workOrderId}/tasks`);
  const docRef = await addDoc(tasksCol, {
    workOrderId,
    description,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const toggleWorkOrderTask = async (workOrderId: string, taskId: string, isCompleted: boolean): Promise<void> => {
  const docRef = doc(db, `work_orders/${workOrderId}/tasks`, taskId);
  await updateDoc(docRef, { isCompleted });
};

export const deleteWorkOrderTask = async (workOrderId: string, taskId: string): Promise<void> => {
  const docRef = doc(db, `work_orders/${workOrderId}/tasks`, taskId);
  await deleteDoc(docRef);
};

// --- PARTS ---

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  const partsCol = collection(db, `work_orders/${workOrderId}/parts`);
  const q = query(partsCol, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkOrderPart));
};

export const addWorkOrderPart = async (workOrderId: string, part: Omit<WorkOrderPart, 'id' | 'workOrderId' | 'createdAt'>): Promise<string> => {
  const partsCol = collection(db, `work_orders/${workOrderId}/parts`);
  const docRef = await addDoc(partsCol, {
    ...part,
    workOrderId,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const deleteWorkOrderPart = async (workOrderId: string, partId: string): Promise<void> => {
  const docRef = doc(db, `work_orders/${workOrderId}/parts`, partId);
  await deleteDoc(docRef);
};
