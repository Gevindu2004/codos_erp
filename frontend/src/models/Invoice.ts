export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceLineItem {
  id?: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
}

export interface Invoice {
  id?: string;
  invoiceNumber: string; // e.g. "INV-1001"
  clientId: string;
  workOrderId?: string; // Optional, if generated from WO
  
  status: InvoiceStatus;
  
  issueDate: string;
  dueDate: string;
  
  subtotal: number;
  taxRate: number; // e.g. 0.08 for 8%
  taxAmount: number;
  total: number;
  
  notes?: string;
  
  createdAt?: string;
  updatedAt?: string;
}
