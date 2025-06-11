import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Param,
  Patch,
  ForbiddenException
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { User } from 'src/users/interfaces/user.interface';

@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Endpoint para crear una orden
  @Post()
  @Roles('buyer') 
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: { user: User },
  ) {
    if (req.user.role !== 'buyer') {
      throw new ForbiddenException('Only buyers can create orders.');
    }
    return this.ordersService.createOrder(createOrderDto, req.user.id!);
  }

  @Get()
  @Roles('buyer', 'seller', 'admin') 
  async findAll(@Request() req: { user: User }, @Query() filterDto: FilterOrderDto) {
    return this.ordersService.findAllOrders(req.user, filterDto);
  }

  @Get(':id')
  @Roles('buyer', 'seller', 'admin') 
  async findOne(@Param('id') id: string, @Request() req: { user: User }) {
    return this.ordersService.findOrderById(id, req.user);
  }

  @Patch(':id/status') 
  @Roles('admin') 
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: { user: User },
  ) {
    if (req.user.role !== 'admin') {
        throw new ForbiddenException('Sólo los administradores pueden actualizar el estado del pedido.');
    }
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto, req.user);
  }
}