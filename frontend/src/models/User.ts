export type Role = 'Admin' | 'Manager' | 'Technician' | 'Client';

export interface User {
  id: string; // Firebase Auth UID
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Role;
  status: 'active' | 'inactive';
  createdAt: string | Date;
  updatedAt: string | Date;
}
