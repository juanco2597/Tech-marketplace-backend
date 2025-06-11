import * as admin from 'firebase-admin'; 

export interface Product {
  id?: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  imageUrl: string; 
  sellerId: string; 
  createdAt?: admin.firestore.FieldValue;
  updatedAt?: admin.firestore.FieldValue;
}