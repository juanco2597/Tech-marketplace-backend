import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto'; 
import * as bcrypt from 'bcryptjs'; 

@Injectable()
export class UsersService {
  private usersCollection: admin.firestore.CollectionReference;

  constructor(
    @Inject('FIRESTORE_DB') private firestore: admin.firestore.Firestore,
  ) {
    this.usersCollection = this.firestore.collection('users');
  }

  // Método para encontrar un usuario por email 
  async findOneByEmail(email: string): Promise<User | undefined> {
    const snapshot = await this.usersCollection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return undefined;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  // Método para encontrar un usuario por ID
  async findOneById(id: string): Promise<User | undefined> {
    const doc = await this.usersCollection.doc(id).get();
    if (!doc.exists) {
      return undefined;
    }
    return { id: doc.id, ...doc.data() } as User;
  }

  // Método para encontrar todos los usuarios
  async findAll(): Promise<User[]> {
    const snapshot = await this.usersCollection.get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
   
      const { password, ...result } = doc.data() as User; 
      return { id: doc.id, ...result } as User;
    });
  }

  // Método para crear un nuevo usuario
  async create(user: Omit<User, 'id'>): Promise<User> {
    const newUserRef = this.usersCollection.doc();
    await newUserRef.set(user);
    return { id: newUserRef.id, ...user };
  }

  // Metodo para actualizar un usuario
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
    if (Object.keys(dataToUpdate).length === 1 && dataToUpdate.updatedAt) {}

    await userRef.update(dataToUpdate); 

    const updatedDoc = await userRef.get();
    const { password, ...result } = updatedDoc.data() as User;
    return { id: updatedDoc.id, ...result } as User;
  }

  // Metodo para eliminar un usuario
  async deleteUser(id: string): Promise<{ message: string }> {
    const userRef = this.usersCollection.doc(id);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    await userRef.delete();
    return { message: 'Usuario eliminado exitosamente.' };
  }
}