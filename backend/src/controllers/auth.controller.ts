import { Request, Response } from 'express';
import { auth, db } from '../firebase/admin';
import { User, Role } from '../models/User';
import { logActivity } from '../services/activity.service';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // 1. Basic Validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ status: 'error', message: 'Missing required fields' });
      return;
    }
    
    if (phone && !/^\d{10}$/.test(phone)) {
      res.status(400).json({ status: 'error', message: 'Phone number must be exactly 10 digits' });
      return;
    }

    // Default role if not provided, or strictly assign 'Admin' for the first user
    const assignedRole: Role = role || 'Admin';

    // 2. Create User in Firebase Authentication
    const userRecord = await auth!.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    // 3. Save User Profile in Firestore
    const newUser: User = {
      id: userRecord.uid,
      email,
      firstName,
      lastName,
      phone: phone || '',
      role: assignedRole,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db!.collection('users').doc(userRecord.uid).set(newUser);

    // Log Activity
    await logActivity({
      userId: userRecord.uid,
      userEmail: email,
      userName: `${firstName} ${lastName}`,
      module: 'AUTH',
      action: 'CREATED',
      description: `New user account created: ${firstName} ${lastName} (${role})`,
    });

    // 4. Return Success
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        uid: userRecord.uid,
        email: newUser.email,
        role: newUser.role,
      }
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Error registering user' 
    });
  }
};
