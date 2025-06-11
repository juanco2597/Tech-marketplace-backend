import { Controller, Post, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';   
import { Public } from 'src/common/decorators/public.decorator'; 

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Ruta pública para registrar un nuevo usuario
  @Public() 
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // Ruta pública para iniciar sesión
  @Public() 
  @UseGuards(LocalAuthGuard) 
  @Post('login')
  @HttpCode(HttpStatus.OK) 
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // Ruta protegida que requiere autenticación JWT
  @UseGuards(JwtAuthGuard) 
  @Post('profile')
  getProfile(@Request() req) {
    return req.user; 
  }
}