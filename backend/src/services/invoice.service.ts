import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import type { Invoice, InvoiceLineItem, InvoiceStatus } from '../models/Invoice';
import { getWorkOrderById, getWorkOrderParts } from './workorder.service';

export const getInvoices = async (statusFilter?: InvoiceStatus): Promise<Invoice[]> => {
  const invCol = collection(db, 'invoices');
  let q;
  if (statusFilter) {
    q = query(invCol, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
  } else {
    q = query(invCol, orderBy('createdAt', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
  const docRef = doc(db, 'invoices', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Invoice;
  }
  return null;
};

export const addInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const invCol = collection(db, 'invoices');
  const docRef = await addDoc(invCol, {
    ...invoice,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateInvoice = async (id: string, updates: Partial<Invoice>): Promise<void> => {
  const docRef = doc(db, 'invoices', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const docRef = doc(db, 'invoices', id);
  await deleteDoc(docRef);
};

// --- LINE ITEMS ---

export const getInvoiceLineItems = async (invoiceId: string): Promise<InvoiceLineItem[]> => {
  const itemsCol = collection(db, `invoices/${invoiceId}/line_items`);
  const snapshot = await getDocs(itemsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvoiceLineItem));
};

export const addInvoiceLineItem = async (invoiceId: string, item: Omit<InvoiceLineItem, 'id' | 'invoiceId' | 'total'>): Promise<string> => {
  const itemsCol = collection(db, `invoices/${invoiceId}/line_items`);
  const total = item.quantity * item.unitPrice;
  const docRef = await addDoc(itemsCol, {
    ...item,
    invoiceId,
    total,
  });
  
  await recalculateInvoiceTotals(invoiceId);
  return docRef.id;
};

export const deleteInvoiceLineItem = async (invoiceId: string, itemId: string): Promise<void> => {
  const docRef = doc(db, `invoices/${invoiceId}/line_items`, itemId);
  await deleteDoc(docRef);
  await recalculateInvoiceTotals(invoiceId);
};

export const recalculateInvoiceTotals = async (invoiceId: string): Promise<void> => {
  const inv = await getInvoiceById(invoiceId);
  if (!inv) return;
  
  const items = await getInvoiceLineItems(invoiceId);
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * inv.taxRate;
  const total = subtotal + taxAmount;
  
  await updateInvoice(invoiceId, { subtotal, taxAmount, total });
};

// --- HELPER: GENERATE INVOICE FROM WORK ORDER ---
import { getEquipmentById } from './equipment.service';

export const generateInvoiceFromWorkOrder = async (workOrderId: string): Promise<string> => {
  const wo = await getWorkOrderById(workOrderId);
  if (!wo) throw new Error("Work Order not found");

  const parts = await getWorkOrderParts(workOrderId);
  
  // Generate random invoice number
  const invNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const invoiceId = await addInvoice({
    invoiceNumber: invNumber,
    clientId: wo.clientId,
    workOrderId: wo.id,
    status: 'DRAFT',
    issueDate: today,
    dueDate: dueDateStr,
    subtotal: 0,
    taxRate: 0.10, // Default 10% tax for example
    taxAmount: 0,
    total: 0,
    notes: `Generated from Appointment: ${wo.title}`
  });

  // Add main service as a line item if it exists
  if (wo.equipmentId) {
    const service = await getEquipmentById(wo.equipmentId);
    if (service) {
      await addInvoiceLineItem(invoiceId, {
        description: `Service: ${service.name}`,
        quantity: 1,
        unitPrice: service.basePrice || 0
      });
    }
  }

  // Add parts (retail products) as line items
  for (const part of parts) {
    await addInvoiceLineItem(invoiceId, {
      description: part.partName,
      quantity: part.quantity,
      unitPrice: part.cost
    });
  }

  return invoiceId;
};
