// src/products/products.service.ts (Código actual con la corrección del error)
import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Product } from './interfaces/product.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // Importa el nuevo DTO
import { User } from 'src/users/interfaces/user.interface';

@Injectable()
export class ProductsService {
  private productsCollection: admin.firestore.CollectionReference;

  constructor(
    @Inject('FIRESTORE_DB') private firestore: admin.firestore.Firestore,
  ) {
    this.productsCollection = this.firestore.collection('products');
  }

  async createProduct(
    createProductDto: CreateProductDto,
    imageUrl: string,
    sellerId: string,
  ): Promise<Product> {
    const { name, sku, quantity, price } = createProductDto;
    if (!name || !sku || quantity === undefined || price === undefined || !imageUrl || !sellerId) {
      throw new BadRequestException('All product attributes (name, sku, quantity, price, imageUrl, sellerId) are required.');
    }
    const newProduct: Omit<Product, 'id'> = {
      name,
      sku,
      quantity,
      price,
      imageUrl,
      sellerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const productRef = this.productsCollection.doc();
    await productRef.set(newProduct);
    return { id: productRef.id, ...newProduct };
  }

  async findAllProducts(
    user: User | undefined,
    filterDto: FilterProductDto,
  ): Promise<Product[]> {
    // ... (código existente)
    let query: admin.firestore.Query = this.productsCollection;

    if (filterDto.name) {
      query = query.where('name', '>=', filterDto.name).where('name', '<=', filterDto.name + '\uf8ff');
    }
    if (filterDto.sku) {
      query = query.where('sku', '==', filterDto.sku);
    }
    if (filterDto.minPrice !== undefined) {
      query = query.where('price', '>=', filterDto.minPrice);
    }
    if (filterDto.maxPrice !== undefined) {
      query = query.where('price', '<=', filterDto.maxPrice);
    }
    if (user && user.role === 'seller') {
      query = query.where('sellerId', '==', user.id);
    } else if (user && user.role === 'admin') {
      if (filterDto.sellerId) {
        query = query.where('sellerId', '==', filterDto.sellerId);
      }
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async findOne(id: string): Promise<Product | undefined> {
    const doc = await this.productsCollection.doc(id).get();
    if (!doc.exists) {
      return undefined;
    }
    return { id: doc.id, ...doc.data() } as Product;
  }

  // Nuevo método para actualizar un producto
  async updateProduct(
    productId: string,
    updateProductDto: UpdateProductDto,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<Product> {
    const productRef = this.productsCollection.doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      throw new BadRequestException('Product not found.');
    }

    const existingProduct = doc.data() as Product;
    if (currentUserRole === 'seller' && existingProduct.sellerId !== currentUserId) {
      throw new UnauthorizedException('You are not authorized to update this product.');
    }
    else if (currentUserRole !== 'seller' && currentUserRole !== 'admin') {
        throw new UnauthorizedException('You do not have permission to update products.');
    }

    const dataToUpdate: { [key: string]: any } = {};
    for (const key in updateProductDto) {
      if (updateProductDto.hasOwnProperty(key) && updateProductDto[key] !== undefined) {
        dataToUpdate[key] = updateProductDto[key];
      }
    }

    dataToUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await productRef.update(dataToUpdate); 

    const updatedDoc = await productRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Product;
  }

  // Nuevo método para eliminar un producto
  async deleteProduct(productId: string, currentUserId: string, currentUserRole: string): Promise<{ message: string }> {
    const productRef = this.productsCollection.doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      throw new BadRequestException('Producto no encontrado.');
    }

    const existingProduct = doc.data() as Product;

    if (currentUserRole === 'seller' && existingProduct.sellerId !== currentUserId) {
      throw new UnauthorizedException('No estás autorizado a eliminar este producto.');
    }
    else if (currentUserRole !== 'seller' && currentUserRole !== 'admin') {
        throw new UnauthorizedException('No tienes permiso para eliminar productos.');
    }

    await productRef.delete();
    return { message: 'Producto eliminado exitosamente.' };
  }
}