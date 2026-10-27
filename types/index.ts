export interface Product {
  id: number;
  clientId: string;
  name: string;
  quantity: number;
  price: number;
  updatedAt: Date;
  syncedAt: Date | null;
}

export interface ProductFormData {
  name: string;
  quantity: number;
  price: number;
}

export interface RemoteProduct {
  id?: number;
  user_id?: string;
  client_id: string;
  name: string;
  quantity: number;
  price: number;
  updated_at: string;
  created_at?: string;
}

export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  message: string;
}
