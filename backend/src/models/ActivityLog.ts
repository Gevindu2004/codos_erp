export type ActivityModule = 
  | 'AUTH' 
  | 'CLIENTS' 
  | 'EQUIPMENT' 
  | 'WORK_ORDERS' 
  | 'INVENTORY' 
  | 'INVOICES' 
  | 'SETTINGS';

export type ActivityAction = 
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'STATUS_CHANGED'
  | 'LOGGED_IN'
  | 'LOGGED_OUT'
  | 'ASSIGNED';

export interface ActivityLog {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  module: ActivityModule;
  action: ActivityAction;
  description: string; // e.g. "John Doe created Work Order #1234"
  targetId?: string; // Optional ID of the item being manipulated
  timestamp: string;
}
