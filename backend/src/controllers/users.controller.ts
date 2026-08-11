import { Request, Response } from 'express';
import { auth, db } from '../firebase/admin';
import { logActivity } from '../services/activity.service';

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.params.uid as string;
    const { firstName, lastName, phone, role, status } = req.body;

    if (!uid) {
      res.status(400).json({ status: 'error', message: 'User ID is required' });
      return;
    }

    // 1. Update Firebase Auth Display Name if name changed
    if (firstName || lastName) {
      const userRecord = await auth!.getUser(uid);
      const currentFirstName = userRecord.displayName?.split(' ')[0] || '';
      const currentLastName = userRecord.displayName?.split(' ').slice(1).join(' ') || '';
      
      const newFirstName = firstName || currentFirstName;
      const newLastName = lastName || currentLastName;
      
      await auth!.updateUser(uid, {
        displayName: `${newFirstName} ${newLastName}`,
      });
    }

    // 2. Update Firestore Document
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    await db!.collection('users').doc(uid).update(updateData);

    // 3. Log Activity
    await logActivity({
      userId: 'system', // Ideally extracted from token in real auth middleware
      userEmail: 'system',
      userName: 'System Admin',
      module: 'AUTH',
      action: 'UPDATED',
      description: `User account updated: ${uid} (Role: ${role || 'unchanged'})`,
    });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
    });
  } catch (error: any) {
    console.error('Update User Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Error updating user' 
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = req.params.uid as string;

    if (!uid) {
      res.status(400).json({ status: 'error', message: 'User ID is required' });
      return;
    }

    // 1. Check if the user being deleted is an Admin
    const userDoc = await db!.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ status: 'error', message: 'User not found in database' });
      return;
    }

    const userData = userDoc.data();
    if (userData?.role === 'Admin') {
      res.status(403).json({ status: 'error', message: 'Cannot delete an Admin account. Please demote them to a lower role first.' });
      return;
    }

    // 2. Get user email before deletion for logging
    const userRecord = await auth!.getUser(uid);
    const userEmail = userRecord.email;

    // 2. Delete from Firebase Authentication
    await auth!.deleteUser(uid);

    // 3. Delete from Firestore
    await db!.collection('users').doc(uid).delete();

    // 4. Log Activity
    await logActivity({
      userId: 'system', // Ideally extracted from token in real auth middleware
      userEmail: 'system',
      userName: 'System Admin',
      module: 'AUTH',
      action: 'DELETED',
      description: `User account deleted: ${userEmail} (${uid})`,
    });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete User Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Error deleting user' 
    });
  }
};
