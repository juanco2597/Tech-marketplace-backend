import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';


export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  REFUNDED = 'refunded',
}

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsEnum(OrderStatus, { message: 'El estado de la orden no es válido.' })
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus, { message: 'El estado del pago no es válido.' })
  paymentStatus?: PaymentStatus;
}