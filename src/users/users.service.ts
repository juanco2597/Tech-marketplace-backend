import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common'; 
import * as admin from 'firebase-admin';
import { User } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { SellerRequest } from './interfaces/seller-request.interface';

@Injectable()
export class UsersService {
  private usersCollection: admin.firestore.CollectionReference;
  private sellerRequestsCollection: admin.firestore.CollectionReference;

  constructor(
    @Inject('FIRESTORE_DB') private firestore: admin.firestore.Firestore,
  ) {
    this.usersCollection = this.firestore.collection('users');
    this.sellerRequestsCollection = this.firestore.collection('seller_requests');
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const snapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return undefined;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async findOneById(id: string): Promise<User | undefined> {
    const doc = await this.usersCollection.doc(id).get();
    if (!doc.exists) {
      return undefined;
    }
    return { id: doc.id, ...doc.data() } as User;
  }

  async findAll(): Promise<User[]> {
    const snapshot = await this.usersCollection.get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const { password, ...result } = data as User;

      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        result.createdAt = data.createdAt.toDate().toISOString();
      }
      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        result.updatedAt = data.updatedAt.toDate().toISOString();
      } else if (data.updatedAt === undefined) {
         result.updatedAt = result.createdAt;
      }
      return { id: doc.id, ...result } as User;
    });
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUserRef = this.usersCollection.doc();
    await newUserRef.set(user);
    return { id: newUserRef.id, ...user };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const userRef = this.usersCollection.doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const dataToUpdate: { [key: string]: any } = {};
    for (const key in updateUserDto) {
      if (updateUserDto[key] !== undefined) {
        dataToUpdate[key] = updateUserDto[key];
      }
    }

    if (dataToUpdate.password) {
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, 10);
    }

    dataToUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await userRef.update(dataToUpdate);

    const updatedDoc = await userRef.get();
    const { password, ...result } = updatedDoc.data() as User;
    return { id: updatedDoc.id, ...result } as User;
  }

  async updateUserRole(id: string, newRole: 'buyer' | 'seller' | 'admin'): Promise<User> {
    const userRef = this.usersCollection.doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const validRoles = ['buyer', 'seller', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new BadRequestException(`Rol '${newRole}' invalido.`);
    }

    await userRef.update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), 
    });

    const updatedDoc = await userRef.get();
    const { password, ...result } = updatedDoc.data() as User;
    return { id: updatedDoc.id, ...result } as User;
  }


  async deleteUser(id: string): Promise<{ message: string }> {
    const userRef = this.usersCollection.doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    await userRef.delete();
    return { message: 'Usuario eliminado exitosamente.' };
  }

  async createSellerRequest(email: string): Promise<void> {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found for seller request.`);
    }

    const existingRequestsSnapshot = await this.sellerRequestsCollection
      .where('userId', '==', user.id)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (!existingRequestsSnapshot.empty) {
      console.log(`Solicitud de vendedor ya existe y esta pendiente para el usuario ${user.email}`);
      return;
    }

    const newRequestRef = this.sellerRequestsCollection.doc();
    if (!user.id) {
      throw new Error(`El ID de usuario no est\u00E1 definido para el usuario con correo electronico ${email}`);
    }
    const request: Omit<SellerRequest, 'id'> = { 
      userId: user.id,
      userEmail: user.email,
      status: 'pending',
      requestDate: admin.firestore.FieldValue.serverTimestamp() as any, 
    };
    await newRequestRef.set(request);
    console.log(`Solicitud de vendedor creada en Firestore para ${user.email}`);
  }

  async getAllSellerRequests(): Promise<SellerRequest[]> {
    const snapshot = await this.sellerRequestsCollection.get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const request: SellerRequest = { id: doc.id, ...data } as SellerRequest;

      if (data.requestDate && typeof data.requestDate.toDate === 'function') {
        request.requestDate = data.requestDate.toDate().toISOString();
      }
      if (data.processedDate && typeof data.processedDate.toDate === 'function') {
        request.processedDate = data.processedDate.toDate().toISOString();
      }

      return request;
    });
  }

  async updateSellerRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    adminId: string
  ): Promise<void> {
    const requestRef = this.sellerRequestsCollection.doc(requestId);
    const requestDoc = await requestRef.get();

    if (!requestDoc.exists) {
      throw new NotFoundException(`Seller request with ID ${requestId} not found.`);
    }

    const requestData = requestDoc.data() as SellerRequest;

    await requestRef.update({
      status,
      processedDate: admin.firestore.FieldValue.serverTimestamp(), 
      processedBy: adminId,
    });

    if (status === 'approved') {
      const userRef = this.usersCollection.doc(requestData.userId);
      await userRef.update({
        role: 'seller',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Rol de usuario ${requestData.userEmail} (${requestData.userId}) cambiado a 'seller'.`);
    }
  }
}