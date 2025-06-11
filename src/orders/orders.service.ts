import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException, 
  UnauthorizedException, 
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Order } from './interfaces/order.interface';
import { OrderItem } from './interfaces/order-item.interface'; 
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { ProductsService } from 'src/products/products.service'; 
import { User } from 'src/users/interfaces/user.interface'; 
import { plainToClass } from 'class-transformer';

@Injectable()
export class OrdersService {
  private ordersCollection: admin.firestore.CollectionReference;

  constructor(
    @Inject('FIRESTORE_DB') private firestore: admin.firestore.Firestore,
    private productsService: ProductsService, 
  ) {
    this.ordersCollection = this.firestore.collection('orders');
  }

  // Metodo para crear una orden
  async createOrder(createOrderDto: CreateOrderDto, buyerId: string): Promise<Order> {
    const { items, shippingAddress } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('El pedido debe contener al menos un artículo.');
    }

    let totalAmount = 0;
    const orderItemsData: any[] = [];
    const sellerIdsInOrder: Set<string> = new Set();

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product) {
        throw new BadRequestException(`Producto con identificación ${item.productId} no encontrado.`);
      }
      if (product.quantity < item.quantity) {
        throw new BadRequestException(`Stock insuficiente del producto ${product.name}. Disponible: ${item.quantity}, Solicitado: ${product.quantity}.`);
      }

      sellerIdsInOrder.add(product.sellerId);

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        priceAtOrder: product.price,
        imageUrl: product.imageUrl,
        sellerId: product.sellerId,
      });
    }

    const plainShippingAddress = { ...shippingAddress }; 
    const newOrder: Omit<Order, 'id' | 'items'> = {
      buyerId: buyerId,
      orderDate: admin.firestore.Timestamp.now(),
      totalAmount: totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
      shippingAddress: plainShippingAddress, 
      sellerIds: Array.from(sellerIdsInOrder),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const orderRef = this.ordersCollection.doc();
    await orderRef.set(newOrder);

    const orderItemsBatch = this.firestore.batch();
    for (const itemData of orderItemsData) {
      const itemRef = orderRef.collection('orderItems').doc();
      orderItemsBatch.set(itemRef, itemData);
    }
    await orderItemsBatch.commit();

    const productUpdateBatch = this.firestore.batch();
    for (const item of items) {
        const productDocRef = this.firestore.collection('products').doc(item.productId);
        productUpdateBatch.update(productDocRef, {
            quantity: admin.firestore.FieldValue.increment(-item.quantity)
        });
    }
    await productUpdateBatch.commit();
    return { id: orderRef.id, ...newOrder, items: orderItemsData as any };
  }

 // Metodo para obtener todas las órdenes con filtro
  async findAllOrders(user: User, filterDto: FilterOrderDto): Promise<Order[]> {
    let query: admin.firestore.Query = this.ordersCollection;

    if (filterDto.buyerId) {
      query = query.where('buyerId', '==', filterDto.buyerId);
    } else if (user.role === 'buyer') {
      query = query.where('buyerId', '==', user.id!); 
    }

    if (filterDto.sellerId) {
      query = query.where('sellerIds', 'array-contains', filterDto.sellerId);
    } else if (user.role === 'seller') {
      query = query.where('sellerIds', 'array-contains', user.id!); 
    }

    if (filterDto.status) {
      query = query.where('status', '==', filterDto.status);
    }

    if (filterDto.paymentStatus) {
      query = query.where('paymentStatus', '==', filterDto.paymentStatus);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      return [];
    }

    const orders: Order[] = [];
    for (const doc of snapshot.docs) {
      const orderData = doc.data() as Omit<Order, 'id' | 'items'>;
      const orderItemsSnapshot = await doc.ref.collection('orderItems').get();
      const items: OrderItem[] = orderItemsSnapshot.docs.map(itemDoc => itemDoc.data() as OrderItem);
      orders.push({ id: doc.id, ...orderData, items });
    }
    return orders;
  }

  // Metodo para encontrar una orden por ID
  async findOrderById(orderId: string, user: User): Promise<Order> {
    const orderDoc = await this.ordersCollection.doc(orderId).get();

    if (!orderDoc.exists) {
      throw new NotFoundException(`No se encontró el pedido con el ID ${orderId}.`);
    }

    const orderData = orderDoc.data() as Omit<Order, 'id' | 'items'>;

    if (user.role !== 'admin') {
      if (user.role === 'buyer' && orderData.buyerId !== user.id!) { 
        throw new UnauthorizedException('No está autorizado para ver este pedido.');
      } else if (user.role === 'seller' && !orderData.sellerIds.includes(user.id!)) { 
        throw new UnauthorizedException('You are not authorized to view this order.');
      }
    }

    const orderItemsSnapshot = await orderDoc.ref.collection('orderItems').get();
    const items: OrderItem[] = orderItemsSnapshot.docs.map(itemDoc => itemDoc.data() as OrderItem);

    return { id: orderDoc.id, ...orderData, items };
  }

  // Metodo para actualizar el estado de una orden
  async updateOrderStatus(
    orderId: string,
    updateDto: UpdateOrderStatusDto,
    currentUser: User,
  ): Promise<Order> {
    const orderRef = this.ordersCollection.doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new NotFoundException(`No se encontró el pedido con el ID ${orderId}.`);
    }

    const existingOrder = orderDoc.data() as Omit<Order, 'id' | 'items'>;

    if (currentUser.role !== 'admin') {
      throw new UnauthorizedException('Sólo los administradores pueden actualizar el estado del pedido.');
    }

    const dataToUpdate: { [key: string]: any } = {};
    if (updateDto.status !== undefined) {
      dataToUpdate.status = updateDto.status;
    }
    if (updateDto.paymentStatus !== undefined) {
      dataToUpdate.paymentStatus = updateDto.paymentStatus;
    }
    dataToUpdate.updatedAt = admin.firestore.FieldValue.serverTimestamp();

    await orderRef.update(dataToUpdate);


    const updatedOrderDoc = await orderRef.get();
    const orderItemsSnapshot = await updatedOrderDoc.ref.collection('orderItems').get();
    const items: OrderItem[] = orderItemsSnapshot.docs.map(itemDoc => itemDoc.data() as OrderItem);

    return { id: updatedOrderDoc.id, ...updatedOrderDoc.data() as Omit<Order, 'id' | 'items'>, items };
  }
}