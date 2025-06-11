import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  ValidateNested,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer'; 

// Enum para el estado de la orden
export class CreateOrderItemDto {
  @IsNotEmpty({ message: 'El ID del producto es requerido para el artículo.' })
  @IsString({ message: 'El ID del producto debe ser una cadena de texto.' })
  productId: string;

  @IsNotEmpty({ message: 'La cantidad es requerida para el artículo.' })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @Min(1, { message: 'La cantidad no puede ser menor a 1.' })
  quantity: number;
}

// DTO para la dirección de envío
export class ShippingAddressDto {
  @IsNotEmpty({ message: 'La direccion es requerida.' })
  @IsString({ message: 'La direccion debe ser una cadena de texto.' })
  street: string;

  @IsNotEmpty({ message: 'La ciudad es requerida.' })
  @IsString({ message: 'La ciudad debe ser una cadena de texto.' })
  city: string;

  @IsNotEmpty({ message: 'El estado es requerido.' })
  @IsString({ message: 'El estado debe ser una cadena de texto.' })
  state: string;

  @IsNotEmpty({ message: 'El código postal es requerido.' })
  @IsString({ message: 'El código postal debe ser una cadena de texto.' })
  zipCode: string;

  @IsNotEmpty({ message: 'El país es requerido.' })
  @IsString({ message: 'El país debe ser una cadena de texto.' })
  country: string;
}

// DTO para crear una nueva orden
export class CreateOrderDto {
  @IsArray({ message: 'Los artículos deben ser un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto) 
  items: CreateOrderItemDto[];

  @IsNotEmpty({ message: 'La dirección de envío es requerida.' })
  @IsObject({ message: 'La dirección de envío debe ser un objeto.' })
  @ValidateNested()
  @Type(() => ShippingAddressDto) 
  shippingAddress: ShippingAddressDto;
}