export interface Equipment {
  id?: string;
  clientId: string; // Keep this to associate service with a specific customer (or branch) if needed, though for a salon, services might be global. We'll leave it to not break the DB schema completely.
  siteId: string;
  name: string; // Service Name (e.g. Haircut)
  category: string; // e.g. Hair, Skin, Nails
  durationMinutes: number;
  basePrice: number;
  status: 'ACTIVE' | 'INACTIVE';
  manualUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceLog {
  // We can repurpose this as "Service History Notes" or keep it as is for now
  id?: string;
  equipmentId: string;
  date: string;
  description: string;
  technicianName: string;
  cost?: number;
  type: 'PREVENTATIVE' | 'REPAIR' | 'INSPECTION';
  createdAt?: string;
}
