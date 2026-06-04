import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartRepository, CouponRepository, OrderDocument, OrderProduct, OrderRepository, type ProductDocument, ProductRepository, type UserDocument } from 'src/db';
import { CouponEnum } from 'src/common';
import { randomUUID } from 'crypto';
import { CartService } from '../cart/cart.service';
import { OrderStatusEnum, PaymentEnum } from 'src/common/enums/order.enum';
import { PaymentService } from 'src/common/services';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import type { Request } from 'express';

@Injectable()
export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly orderRepository: OrderRepository,
    private readonly couponRepository: CouponRepository,
    private readonly cartRepository: CartRepository,
    private readonly cartService: CartService,
    private readonly productRepository: ProductRepository,
  ) { }

  async webhook(req: Request) {
    const event = await this.paymentService.webhook(req);
    const { orderId } = event.data.object.metadata as { orderId: string };

    const order = await this.orderRepository.findOneAndUpdate({
      filter: { _id: Types.ObjectId.createFromHexString(orderId), status: OrderStatusEnum.pending, paymentType: PaymentEnum.card },
      update: {
        paidAt: new Date(),
        status: OrderStatusEnum.placed,
      }
    })

    if (!order) {
      throw new NotFoundException('fail to find matching order');
    }
    await this.paymentService.confirmIntent(order.intentId)
  }


  async create(user: UserDocument, createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const cart = await this.cartRepository.findOne({
      filter: { createdBy: user._id },
    })
    if (!cart?.products?.length) {
      throw new NotFoundException('cart is empty');
    }

    let discount = 0;
    let coupon: any;
    if (createOrderDto.coupon) {
      coupon = await this.couponRepository.findOne({
        filter: { _id: createOrderDto.coupon, startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }
      })

      if (!coupon) {
        throw new NotFoundException('coupon not found');
      }

      if (coupon.duration <= coupon.usedBy.filter((ele) => { return ele.toString() == user._id.toString() }).length) {
        throw new BadRequestException('coupon is expired');
      }
    }

    let total = 0;
    let products: OrderProduct[] = []
    for (const product of cart.products) {
      const cartProduct = await this.productRepository.findOne({
        filter: { _id: product.productId, stock: { $gte: product.quantity } }
      })
      if (!cartProduct) {
        throw new NotFoundException(`Product not found ${product.productId} or out of stock`);
      }
      const finalPrice = product.quantity * cartProduct.salePrice;
      products.push({ productId: cartProduct._id, quantity: product.quantity, unitPrice: cartProduct.salePrice, finalPrice });
      total += finalPrice;
    }

    if (coupon) {
      discount = coupon.type === CouponEnum.percent ? coupon.discount / 100 : coupon.discount / total;
    }

    delete createOrderDto.coupon;

    const [order] = await this.orderRepository.create({
      data: [{
        ...createOrderDto,
        coupon: coupon?._id,
        discount,
        createdBy: user._id,
        products,
        total,
        orderId: randomUUID().slice(0, 8),
      }]
    })

    if (!order) {
      throw new BadRequestException('order not created');
    }

    if (coupon) {
      coupon.usedBy.push(user._id);
      await coupon.save();
    }


    for (const product of cart.products) {
      await this.productRepository.updateOne({
        filter: { _id: product.productId, stock: { $gte: product.quantity } },
        update: {
          $inc: { __v: 1, stock: -product.quantity }
        }
      })

    }


    await this.cartService.remove(user)


    return order;
  }

  async cancel(orderId: Types.ObjectId, user: UserDocument): Promise<OrderDocument> {
    const order = await this.orderRepository.findOneAndUpdate({
      filter: { _id: orderId, status: { $lt: OrderStatusEnum.canceled } },
      update: {
        status: OrderStatusEnum.canceled,
        updatedBy: user._id
      }
    })

    if (!order) {
      throw new NotFoundException('order not found');
    }

    for (const product of order.products) {
      await this.productRepository.updateOne({
        filter: { _id: product.productId },
        update: {
          $inc: { __v: 1, stock: product.quantity }
        }
      })

    }

    if (order.coupon) {
      await this.couponRepository.updateOne({
        filter: { _id: order.coupon },
        update: { $pull: { usedBy: order.createdBy } }
      })
    }

    if (order.paymentType === PaymentEnum.card) {
      await this.paymentService.refund(order.intentId)
    }
    return order as OrderDocument;
  }


  async checkOut(orderId: Types.ObjectId, user: UserDocument) {
    const order = await this.orderRepository.findOne({
      filter: { _id: orderId, createdBy: user._id, status: OrderStatusEnum.pending, paymentType: PaymentEnum.card },
      options: { populate: [{ path: 'products.productId', select: 'name' }] }
    })

    if (!order) {
      throw new NotFoundException('order not found');
    }

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = []

    if (order.discount) {
      const coupon = await this.paymentService.createCoupon({
        duration: 'once',
        currency: 'egp',
        percent_off: order.discount * 100
      })
      discounts.push({ coupon: coupon.id })
    }

    const session = await this.paymentService.checkoutSession({
      customer_email: user.email,
      metadata: { orderId: orderId.toString() },
      line_items: order.products.map(product => {
        return {
          quantity: product.quantity,
          price_data: {
            currency: 'egp',
            product_data: {
              name: (product.productId as unknown as ProductDocument).name,
            },
            unit_amount: product.unitPrice * 100,
          },
        };
      }),
    });

    const method = await this.paymentService.paymentMethod({
      type: 'card',
      card: {
        token: 'tok_visa'
      }
    })

    const intent = await this.paymentService.paymentIntent({
      amount: order.subTotal * 100,
      currency: 'egp',
      payment_method: method.id,
      automatic_payment_methods: {
        allow_redirects: "never",
        enabled: true
      }
    })


    order.intentId = intent.id;
    await order.save();

    return session.url as string;
  }

  // findAll() {
  //   return `This action returns all order`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} order`;
  // }

  // update(id: number, updateOrderDto: UpdateOrderDto) {
  //   return `This action updates a #${id} order`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} order`;
  // }
}
