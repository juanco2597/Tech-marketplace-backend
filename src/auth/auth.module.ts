import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module'; 
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy'; 
import { LocalStrategy } from './strategies/local.strategy'; 
import * as dotenv from 'dotenv';

dotenv.config(); 

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, 
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '1h' }, 
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy], 
  controllers: [AuthController],
})
export class AuthModule {}