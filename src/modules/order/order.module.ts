import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModel, CartRepository, CouponModel, CouponRepository, OrderModel, OrderRepository, ProductModel, ProductRepository } from 'src/db';
import { CartService } from '../cart/cart.service';
import { PaymentService } from 'src/common/services';
import { OrderResolver } from './order.resolver';

@Module({
  imports: [CartModel, OrderModel, ProductModel, CouponModel],
  controllers: [OrderController],
  providers: [OrderResolver,OrderService, OrderRepository, ProductRepository, CartRepository, CouponRepository, CartService,PaymentService],
})
export class OrderModule { }
