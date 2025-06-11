import { IsOptional, IsString } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { PartialType } from '@nestjs/mapped-types';  

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena.' })
  imageUrl?: string; 
}