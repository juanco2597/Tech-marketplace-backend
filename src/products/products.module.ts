import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'; 

@Module({
  imports: [FirebaseModule, CloudinaryModule], 
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService] 
})
export class ProductsModule {}