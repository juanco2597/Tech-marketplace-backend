import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common'; 
import * as admin from 'firebase-admin';
import { Product } from './interfaces/product.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from 'src/users/interfaces/user.interface';
import { CollectionReference } from 'firebase-admin/firestore'; 

@Injectable()
export class ProductsService {
  private productsCollection: CollectionReference;
  private usersCollection: CollectionReference; 

  constructor(
    @Inject('FIREBASE_APP') private readonly firestoreApp: admin.app.App,
  ) {
    this.productsCollection = this.firestoreApp.firestore().collection('products');
    this.usersCollection = this.firestoreApp.firestore().collection('users'); 
  }

  async createProduct(
    createProductDto: CreateProductDto,
    imageUrl: string,
    sellerId: string,
  ): Promise<Product> {
    const { name, sku, quantity, price } = createProductDto;
    if (!name || !sku || quantity === undefined || price === undefined || !imageUrl || !sellerId) {
      throw new BadRequestException('Todos los atributos del producto (nombre, sku, cantidad, precio, URL de imagen, ID de vendedor) son requeridos.');
    }
    const newProduct: Omit<Product, 'id' | 'seller'> = {
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
    const createdProduct = { id: productRef.id, ...newProduct } as Product;
    return (await this.populateSellerInfo([createdProduct]))[0]; 
  }

  async findAllProducts(
    user: User | undefined,
    filterDto: FilterProductDto,
  ): Promise<Product[]> {
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
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return this.populateSellerInfo(products); 
  }

  async findOne(id: string): Promise<Product | undefined> {
    const doc = await this.productsCollection.doc(id).get();
    if (!doc.exists) {
      return undefined;
    }
    const product = { id: doc.id, ...doc.data() } as Product;
    return (await this.populateSellerInfo([product]))[0]; 
  }

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
      throw new UnauthorizedException('No estas autorizado a actualizar este producto.');
    }
    else if (currentUserRole !== 'seller' && currentUserRole !== 'admin') {
        throw new UnauthorizedException('No tienes permiso para actualizar productos.');
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
    return (await this.populateSellerInfo([{ id: updatedDoc.id, ...updatedDoc.data() } as Product]))[0]; 
  }

  async deleteProduct(productId: string, currentUserId: string, currentUserRole: string): Promise<{ message: string }> {
    const productRef = this.productsCollection.doc(productId);
    const doc = await productRef.get();

    if (!doc.exists) {
      throw new BadRequestException('Producto no encontrado.');
    }

    const existingProduct = doc.data() as Product;

    if (currentUserRole === 'seller' && existingProduct.sellerId !== currentUserId) {
      throw new UnauthorizedException('No estas autorizado a eliminar este producto.');
    }
    else if (currentUserRole !== 'seller' && currentUserRole !== 'admin') {
        throw new UnauthorizedException('No tienes permiso para eliminar productos.');
    }

    await productRef.delete();
    return { message: 'Producto eliminado exitosamente.' };
  }

 
  private async populateSellerInfo(products: Product[]): Promise<Product[]> {
      if (products.length === 0) {
          return [];
      }
      const sellerIds = [...new Set(products.map(p => p.sellerId))]; 
      const sellerDocs = await Promise.all(
          sellerIds.map(id => this.usersCollection.doc(id).get()) 
      );

      const sellersMap = new Map<string, { id: string, email: string }>();
      sellerDocs.forEach(doc => {
          if (doc.exists) {
              const userData = doc.data();
              sellersMap.set(doc.id, { id: doc.id, email: userData?.email || 'N/A' });
          }
      });

      return products.map(product => ({
          ...product,
          seller: sellersMap.get(product.sellerId) || { id: product.sellerId, email: 'N/A' }
      }));
  }
}