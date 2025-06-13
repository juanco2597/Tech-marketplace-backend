import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';


@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('request-seller-role')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async requestSellerRole(@Body('email') email: string) {
    console.log(`Recibida solicitud de rol de vendedor para: ${email}`);
    try {
      await this.usersService.createSellerRequest(email);
      return { message: 'Solicitud de rol de vendedor registrada con éxito.' };
    } catch (error) {
      console.error('Error al procesar solicitud de vendedor:', error);
      throw new Error('No se pudo registrar la solicitud de vendedor.');
    }
  }

  
  @Get('seller-requests') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllSellerRequests() {
    return this.usersService.getAllSellerRequests();
  }

  @Patch('seller-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async approveSellerRequest(@Param('id') requestId: string, @Req() req: Request) { 
  try {
    const adminId = (req.user as any).userId; 
    if (!adminId) {
      throw new Error('ID de administrador no disponible en el token.');
    }
    await this.usersService.updateSellerRequestStatus(requestId, 'approved', adminId);
    return { message: `Solicitud ${requestId} ha sido aprobada.` };
  } catch (error) {
    console.error('Error al aprobar solicitud de vendedor:', error);
    throw new NotFoundException('No se pudo aprobar la solicitud o no encontrada.');
  }
}

@Patch('seller-requests/:id/reject')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
  async rejectSellerRequest(@Param('id') requestId: string, @Req() req: Request) { 
    try {
      const adminId = (req.user as any).userId;
      if (!adminId) {
        throw new Error('ID de administrador no disponible en el token.');
      }
      await this.usersService.updateSellerRequestStatus(requestId, 'rejected', adminId);
      return { message: `Solicitud ${requestId} ha sido rechazada.` };
    } catch (error) {
      console.error('Error al rechazar solicitud de vendedor:', error);
      throw new NotFoundException('No se pudo rechazar la solicitud o no encontrada.');
    }
  }

  @Get() 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }

  
  @Get(':id') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    const { password, ...result } = user;
    return result;
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUserRole(@Param('id') id: string, @Body('role') role: 'buyer' | 'seller' | 'admin') {
    try {
      const updatedUser = await this.usersService.updateUserRole(id, role);
      const { password, ...result } = updatedUser;
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error al actualizar el rol del usuario:', error);
      throw new Error('No se pudo actualizar el rol del usuario.');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}