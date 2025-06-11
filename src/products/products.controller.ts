import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Get,
  Query,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
  BadRequestException,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; 
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/users/interfaces/user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FilterProductDto } from './dto/filter-product.dto';
import { Public } from 'src/common/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @Roles('seller')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() body: any, 
    @UploadedFile() image: Express.Multer.File,
    @Request() req: { user: User },
  ) {
    if (req.user.role !== 'seller') {
      throw new UnauthorizedException('Sólo los vendedores pueden crear productos.');
    }
    if (!image) {
      throw new BadRequestException('Se requiere imagen del producto.');
    }
    if (!req.user.id) {
      throw new UnauthorizedException('Se requiere ID de usuario.');
    }

    const createProductDto = plainToClass(CreateProductDto, {
      name: body.name,
      sku: body.sku,
      quantity: Number(body.quantity),
      price: Number(body.price),
    });

    const imageUrl = await this.cloudinaryService.uploadImage(image);
    return this.productsService.createProduct(
      createProductDto,
      imageUrl,
      req.user.id,
    );
  }

  @Get()
  @Public()
  async findAll(@Request() req: { user?: User }, @Query() filterDto: FilterProductDto) {
    const user = req.user;
    return this.productsService.findAllProducts(user, filterDto);
  }

  @Get('my-products')
  @Roles('seller')
  async findMyProducts(@Request() req: { user: User }) {
    return this.productsService.findAllProducts(req.user, { sellerId: req.user.id });
  }

  @Get('all-products')
  @Roles('admin')
  async findAllForAdmin(@Query() filterDto: FilterProductDto, @Request() req: { user: User }) {
    return this.productsService.findAllProducts(req.user, filterDto);
  }

 // Actualizar un producto específico
  @Patch(':id') 
  @Roles('seller', 'admin') 
  @UseInterceptors(FileInterceptor('image')) 
  async update(
    @Param('id') id: string,
    @Body() body: any, 
    @UploadedFile() image: Express.Multer.File,
    @Request() req: { user: User },
  ) {
    if (!req.user.id) {
      throw new UnauthorizedException('User ID is required.');
    }

    const updateProductDto = plainToClass(UpdateProductDto, {
      name: body.name,
      sku: body.sku,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined, 
      price: body.price !== undefined ? Number(body.price) : undefined, 
    });
    if (image) {
      updateProductDto.imageUrl = await this.cloudinaryService.uploadImage(image);
    }

    return this.productsService.updateProduct(
      id,
      updateProductDto,
      req.user.id,
      req.user.role,
    );
  }

  // Eliminar un producto específico
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('seller', 'admin')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: User },
  ) {
    if (!req.user.id) {
      throw new UnauthorizedException('Se requiere ID de usuario.');
    }
    await this.productsService.deleteProduct(
      id,
      req.user.id,
      req.user.role,
    );
  }
}