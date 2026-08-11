export type WorkOrderStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

export interface WorkOrder {
  id?: string;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  
  clientId: string;
  siteId: string;
  equipmentId?: string; // Optional, WO might be for a general site issue
  
  assignedTo?: string; // User ID of technician
  
  scheduledDate?: string;
  completedDate?: string;
  resolutionNotes?: string;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrderTask {
  id?: string;
  workOrderId: string;
  description: string;
  isCompleted: boolean;
  createdAt?: string;
}

export interface WorkOrderPart {
  id?: string;
  workOrderId: string;
  partName: string;
  quantity: number;
  cost: number;
  createdAt?: string;
}
