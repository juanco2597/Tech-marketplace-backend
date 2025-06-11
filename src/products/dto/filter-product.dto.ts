import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterProductDto {
  @IsOptional()
  @IsString({ message: 'El filtro de nombre debe ser una cadena de texto.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El filtro de SKU debe ser una cadena de texto.' })
  sku?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) 
  @IsNumber({}, { message: 'El precio mínimo debe ser un número.' })
  @Min(0, { message: 'El precio mínimo no puede ser negativo.' })
  minPrice?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) 
  @IsNumber({}, { message: 'El precio máximo debe ser un número.' })
  @Min(0, { message: 'El precio máximo no puede ser negativo.' })
  maxPrice?: number;

  @IsOptional()
  @IsString({ message: 'El ID del vendedor debe ser una cadena de texto.' })
  sellerId?: string; 
}