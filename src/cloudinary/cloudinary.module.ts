import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  providers: [
    {
      provide: 'CLOUDINARY',
      useFactory: () => {
        return CloudinaryService.v2.config({ 
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
      },
    },
    CloudinaryService, 
  ],
  exports: [CloudinaryService], 
})
export class CloudinaryModule {}