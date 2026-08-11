export interface Inventory {
  id?: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  quantityOnHand: number;
  reorderPoint: number;
  retailPrice: number;
  wholesaleCost: number;
  supplier: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
