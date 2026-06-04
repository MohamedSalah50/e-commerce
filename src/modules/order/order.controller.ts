import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderParamsDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { auth, IResponse, User } from 'src/common';
import { endpoint } from './authorization.order';
import { type UserDocument } from 'src/db';
import { successResponse } from 'src/utils/response';
import { OrderResponse } from './entities/order.entity';
import type { Request } from 'express';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post("webhook")
  async webhook(@Req() req: Request) {
    await this.orderService.webhook(req);
    return successResponse()
  }

  @auth(endpoint.create)
  @Post()
  async create(@User() user: UserDocument, @Body() createOrderDto: CreateOrderDto): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(user, createOrderDto);
    return successResponse<OrderResponse>({ status: 201, data: { order } });
  }

  @auth(endpoint.create)
  @Patch(":orderId")
  async cancel(@Param() params: OrderParamsDto, @User() user: UserDocument): Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.cancel(params.orderId, user);
    return successResponse<OrderResponse>({ data: { order } });
  }

  @auth(endpoint.create)
  @Post(":orderId")
  async checkOut(@Param() params: OrderParamsDto, @User() user: UserDocument): Promise<IResponse> {
    const session = await this.orderService.checkOut(params.orderId, user);
    return successResponse({ status: 201, data: { session } });
  }

  // @Get()
  // findAll() {
  //   return this.orderService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.orderService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return this.orderService.update(+id, updateOrderDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.orderService.remove(+id);
  // }
}
