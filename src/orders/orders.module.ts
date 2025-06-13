import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from 'src/products/products.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [ProductsModule, FirebaseModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule {}
