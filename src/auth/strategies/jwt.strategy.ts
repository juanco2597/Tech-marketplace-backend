import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service'; 
import * as dotenv from 'dotenv';
import { User } from 'src/users/interfaces/user.interface';

dotenv.config(); 

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extraer JWT del header Authorization
      ignoreExpiration: false, // Asegurar que el token no haya expirado
      secretOrKey: process.env.JWT_SECRET, // La misma clave secreta que usamos para firmar
    });
  }

  async validate(payload: { sub: string, email: string, role: string }): Promise<User> {
    const user = await this.usersService.findOneById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    // Puedes agregar lógica para verificar roles aquí si lo necesitas en el payload
    // Por ahora, solo retornamos el usuario validado
    return user;
  }
}