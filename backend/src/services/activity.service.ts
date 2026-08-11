import { db } from '../firebase/admin';
import { ActivityLog } from '../models/ActivityLog';

export const logActivity = async (activity: Omit<ActivityLog, 'timestamp'>): Promise<void> => {
  if (!db) {
    console.warn('Activity not logged: Firestore is not initialized.');
    return;
  }

  try {
    const newLog: ActivityLog = {
      ...activity,
      timestamp: new Date().toISOString(),
    };

    await db.collection('activity_logs').add(newLog);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
