import * as admin from 'firebase-admin';
import { OrderItem } from './order-item.interface'; 

export interface Order {
  id?: string; 
  buyerId: string;
  orderDate: admin.firestore.Timestamp; 
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; 
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: 'paid' | 'unpaid' | 'refunded'; 
  sellerIds: string[]; 
  items: OrderItem[]; 
  createdAt: admin.firestore.Timestamp | admin.firestore.FieldValue; 
  updatedAt: admin.firestore.Timestamp | admin.firestore.FieldValue; 
}