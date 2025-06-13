import * as admin from 'firebase-admin';

export interface Product {
  id: string; 
  name: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl: string;
  sellerId: string; 
  seller: { 
    id: string;
    email: string; 
  };
  createdAt: admin.firestore.FieldValue | Date;
  updatedAt: admin.firestore.FieldValue | Date;
}