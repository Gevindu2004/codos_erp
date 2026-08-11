export interface Client {
  id?: string;
  name: string;
  industry?: string;
  website?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  id?: string;
  clientId: string; // Parent relationship
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title?: string;
  isPrimary?: boolean;
}

export interface Site {
  id?: string;
  clientId: string; // Parent relationship
  name: string; // e.g., "Headquarters", "Warehouse 1"
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: string;
  longitude?: string;
  notes?: string;
}
