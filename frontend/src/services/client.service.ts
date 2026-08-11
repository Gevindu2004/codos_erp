import { db } from './firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { Client, Contact, Site } from '../models/Client';

// --- CLIENTS ---

export const getClients = async (): Promise<Client[]> => {
  const clientsCol = collection(db, 'clients');
  const q = query(clientsCol, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const getClientById = async (id: string): Promise<Client | null> => {
  const docRef = doc(db, 'clients', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Client;
  }
  return null;
};

export const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const clientsCol = collection(db, 'clients');
  const docRef = await addDoc(clientsCol, {
    ...client,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<void> => {
  const docRef = doc(db, 'clients', id);
  await updateDoc(docRef, {
    ...client,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteClient = async (id: string): Promise<void> => {
  const docRef = doc(db, 'clients', id);
  await deleteDoc(docRef);
};

// --- CONTACTS ---

export const getClientContacts = async (clientId: string): Promise<Contact[]> => {
  const contactsCol = collection(db, `clients/${clientId}/contacts`);
  const snapshot = await getDocs(contactsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact));
};

export const addContact = async (clientId: string, contact: Omit<Contact, 'id' | 'clientId'>): Promise<string> => {
  const contactsCol = collection(db, `clients/${clientId}/contacts`);
  const docRef = await addDoc(contactsCol, {
    ...contact,
    clientId,
  });
  return docRef.id;
};

export const updateContact = async (clientId: string, contactId: string, contact: Partial<Contact>): Promise<void> => {
  const docRef = doc(db, `clients/${clientId}/contacts`, contactId);
  await updateDoc(docRef, contact);
};

export const deleteContact = async (clientId: string, contactId: string): Promise<void> => {
  const docRef = doc(db, `clients/${clientId}/contacts`, contactId);
  await deleteDoc(docRef);
};

// --- SITES ---

export const getClientSites = async (clientId: string): Promise<Site[]> => {
  const sitesCol = collection(db, `clients/${clientId}/sites`);
  const snapshot = await getDocs(sitesCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Site));
};

export const addSite = async (clientId: string, site: Omit<Site, 'id' | 'clientId'>): Promise<string> => {
  const sitesCol = collection(db, `clients/${clientId}/sites`);
  const docRef = await addDoc(sitesCol, {
    ...site,
    clientId,
  });
  return docRef.id;
};

export const updateSite = async (clientId: string, siteId: string, site: Partial<Site>): Promise<void> => {
  const docRef = doc(db, `clients/${clientId}/sites`, siteId);
  await updateDoc(docRef, site);
};

export const deleteSite = async (clientId: string, siteId: string): Promise<void> => {
  const docRef = doc(db, `clients/${clientId}/sites`, siteId);
  await deleteDoc(docRef);
};
