import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { auth, IResponse, RoleEnum, User } from 'src/common';
import { type UserDocument } from 'src/db';
import { successResponse } from 'src/utils/response';
import { CartResponse } from './entities/cart.entity';
import { type Response } from 'express';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@auth([RoleEnum.user])
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  async create(@Body() createCartDto: CreateCartDto,
    @User() user: UserDocument,
    @Res({ passthrough: true }) res: Response
  ): Promise<IResponse<CartResponse>> {

    const { cart, status } = await this.cartService.create(createCartDto, user);
    res.status(status);
    return successResponse<CartResponse>({ status, data: { cart } })
  }

  @Patch()
  async removeFromCart(@Body() removeFromCartDto: RemoveFromCartDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CartResponse>> {

    const cart = await this.cartService.removeFromCart(removeFromCartDto, user);
    return successResponse<CartResponse>({ data: { cart } })
  }

  @Delete()
  async remove(@User() user: UserDocument): Promise<string> {
    await this.cartService.remove(user);
    return "done";
  }

  @Get()
  findAll() {
    return this.cartService.findAll();
  }

  @Get()
  async findOne(@User() user: UserDocument): Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.findOne(user);
    return successResponse<CartResponse>({ data: { cart } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }


}
