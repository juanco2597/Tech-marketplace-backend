import { IsOptional, IsString, IsEnum } from 'class-validator';
import { OrderStatus, PaymentStatus } from './update-order-status.dto'; 

export class FilterOrderDto {
  @IsOptional()
  @IsString({ message: 'El ID del comprador debe ser una cadena de texto.' })
  buyerId?: string; 

  @IsOptional()
  @IsString({ message: 'El ID del vendedor debe ser una cadena de texto.' })
  sellerId?: string; 

  @IsOptional()
  @IsEnum(OrderStatus, { message: 'El estado de la orden no es válido.' })
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'El estado del pago no es válido.' })
  paymentStatus?: PaymentStatus;
}