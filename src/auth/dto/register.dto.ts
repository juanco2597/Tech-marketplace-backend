import { IsEmail, MinLength, IsNotEmpty, Matches } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'El correo electrónico es requerido.' })
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido.' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida.' })
  @Matches('password', '', { message: 'Las contraseñas no coinciden.' })
  confirmPassword: string;
}