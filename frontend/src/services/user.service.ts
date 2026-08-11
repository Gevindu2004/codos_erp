import { db } from './firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import axios from 'axios';
import type { User } from '../models/User';

const API_URL = import.meta.env.VITE_API_URL;

// Fetch all users directly from Firestore (read-only for listing)
export const getUsers = async (): Promise<User[]> => {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('firstName', 'asc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data 
    } as User;
  });
};

// Update user via Node.js Backend API (Requires Admin Privileges)
export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    await axios.put(`${API_URL}/users/${uid}`, data);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete user via Node.js Backend API (Requires Admin Privileges)
export const deleteUser = async (uid: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/users/${uid}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
