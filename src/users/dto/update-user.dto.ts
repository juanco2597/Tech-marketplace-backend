import { IsOptional, IsEmail, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from 'src/auth/dto/register.dto';

export class UpdateUserDto extends PartialType(RegisterDto) {
  @IsOptional()
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El rol debe ser una cadena de texto.' })
  role?: 'buyer' | 'seller' | 'admin';

  @IsOptional()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password?: string;
}