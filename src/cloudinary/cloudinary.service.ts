import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary'; 
import toStream = require('buffer-to-stream'); 

@Injectable()
export class CloudinaryService {
  constructor() {}

  static v2 = v2; 

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { resource_type: 'auto' }, 
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No devolvió ningún resultado de Cloudinary'));
          resolve(result.secure_url); 
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}