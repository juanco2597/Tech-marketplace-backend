import * as admin from 'firebase-admin';
export interface User {
  id?: string; 
  email: string;
  password?: string; 
  role: 'buyer' | 'seller' | 'admin'; 
  createdAt?: admin.firestore.FieldValue;
  updatedAt?: admin.firestore.FieldValue;
}