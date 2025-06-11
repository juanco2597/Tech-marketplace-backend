import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
  NotFoundException, 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Endpoint para obtener un usuario por ID
  @Get(':id')
  @Roles('admin') 
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    const { password, ...result } = user; 
    return result;
  }

  // Endpoint para actualizar un usuario
  @Patch(':id') 
  @Roles('admin') 
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  // Endpoint para eliminar un usuario
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) 
  @Roles('admin') 
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }

  // Endpoint para obtener todos los usuarios
  @Get()
  @Roles('admin')
  async findAll() {
    return this.usersService.findAll();
  }
}