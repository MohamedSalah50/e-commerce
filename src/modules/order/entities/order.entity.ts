import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { IOrder, IOrderProduct, IToken, type IUser } from 'src/common';
import { OrderStatusEnum, PaymentEnum } from 'src/common/enums/order.enum';
import { OneUserResponse } from 'src/modules/user/entities/user.entity';

registerEnumType(OrderStatusEnum, { name: 'OrderStatusEnum' });
registerEnumType(PaymentEnum, { name: 'PaymentEnum' });

export class OrderResponse {
  order: IOrder;
}

@ObjectType({ description: 'get one order product' })  
export class OneOrderProductResponse implements IOrderProduct {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => ID)
  productId: Types.ObjectId;
  @Field(() => Number)
  quantity: number;
  @Field(() => Number)
  unitPrice: number;
  @Field(() => Number)
  finalPrice: number;

  @Field(() => ID, { nullable: true })
  createdBy?: Types.ObjectId;
  @Field(() => ID, { nullable: true })
  updatedBy?: Types.ObjectId;
}

@ObjectType({ description: 'get one order' })
export class OneOrderResponse implements IOrder {
  @Field(() => ID, { nullable: false })
  _id: Types.ObjectId;
  @Field(() => String)
  orderId: string;
  @Field(() => String, { nullable: true })
  intentId?: string;

  @Field(() => String)
  address: string;
  @Field(() => String)
  phone: string;

  @Field(() => String, { nullable: true })
  notes?: string;

  @Field(() => String, { nullable: true })
  cancelReason?: string;
  @Field(() => ID, { nullable: true })
  coupon?: Types.ObjectId;

  @Field(() => Number, { nullable: true })
  discount?: number;

  @Field(() => Number, { nullable: false })
  subTotal: number;
  @Field(() => Number, { nullable: false })
  total: number;
  @Field(() => Date, { nullable: true })
  paidAt?: Date;

  @Field(() => String, { nullable: true })
  paymentIntent?: string;
  @Field(() => [OneOrderProductResponse])
  products: IOrderProduct[];

  @Field(() => OrderStatusEnum)
  status: OrderStatusEnum;
  @Field(() => PaymentEnum)
  paymentType: PaymentEnum;

  @Field(() => OneUserResponse)
  createdBy: IUser;
  @Field(() => ID, { nullable: true })
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  freezedAt?: Date;
  restoredAt?: Date;
}

@ObjectType({ description: 'get all orders' })
export class GetAllOrdersResponse {
  @Field(() => Number, { nullable: true })
  doc_count?: number;
  @Field(() => Number, { nullable: true })
  pages?: number;
  @Field(() => Number, { nullable: true })
  current_page?: number;
  @Field(() => Number, { nullable: true })
  limit?: number;

  @Field(() => [OneOrderResponse])
  result: IToken[];
}
