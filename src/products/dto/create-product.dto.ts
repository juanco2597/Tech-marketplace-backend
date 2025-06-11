import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  name: string;

  @IsNotEmpty({ message: 'El SKU es requerido.' })
  @IsString({ message: 'El SKU debe ser una cadena de texto.' })
  sku: string;

  @IsNotEmpty({ message: 'La cantidad es requerida.' })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' }) 
  @Min(0, { message: 'La cantidad no puede ser negativa.' }) 
  quantity: number;

  @IsNotEmpty({ message: 'El precio es requerido.' })
  @IsNumber({}, { message: 'El precio debe ser un número.' }) 
  @Min(0, { message: 'El precio no puede ser negativo.' }) 
  price: number;
}