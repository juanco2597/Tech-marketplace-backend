import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto'; 
import { User } from 'src/users/interfaces/user.interface';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Método para validar al usuario con email y contraseña
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user; 
      return result;
    }
    return null;
  }

  // Método para iniciar sesión y generar el token JWT
  async login(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role }, 
    };
  }

  // Método para registrar un nuevo usuario
  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, confirmPassword } = registerDto; 

    if (password !== confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('El usuario con este correo electrónico ya existe.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Para crear un nuevo usuario en Firestore
    const newUser = await this.usersService.create({
      email,
      password: hashedPassword,
      role: 'buyer', // Asignar un rol por defecto(comprador)
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const { password: userPassword, ...result } = newUser; 
    return result;
  }
}