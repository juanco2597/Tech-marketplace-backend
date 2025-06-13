export interface SellerRequest {
    id: string;
    userId: string;
    userEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    requestDate: string; 
    processedDate?: string; 
    processedBy?: string; 
}