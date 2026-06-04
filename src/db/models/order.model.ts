import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { OrderStatusEnum, PaymentEnum } from 'src/common/enums/order.enum';
import { IOrder, IOrderProduct, IUser } from 'src/common/interfaces';


@Schema({ timestamps: true, strictQuery: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class OrderProduct implements IOrderProduct {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;
  @Prop({ type: Number, required: true })
  quantity: number;
  @Prop({ type: Number, required: true })
  unitPrice: number;
  @Prop({ type: Number, required: true })
  finalPrice: number;
}


@Schema({ timestamps: true, strictQuery: true })
export class Order implements IOrder {

  @Prop({ type: String, required: true, unique: true })
  orderId: string;

  @Prop({ type: String, required: true })
  address: string;
  @Prop({ type: String, required: true })
  phone: string;
  @Prop({ type: String, required: false })
  notes?: string;
  @Prop({ type: String, required: false })
  cancelReason?: string;
  @Prop({ type: String })
  intentId: string


  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  coupon?: Types.ObjectId;
  @Prop({ type: Number, default: 0 })
  discount: number;

  @Prop({ type: Number, required: true })
  total: number;
  @Prop({ type: Number })
  subTotal: number;



  @Prop({ type: Date, required: false })
  paidAt?: Date;
  @Prop({ type: String, required: false })
  paymentIntent?: string;

  @Prop({ type: String, enum: PaymentEnum, default: PaymentEnum.cash })
  paymentType: PaymentEnum;
  @Prop({
    type: String, enum: OrderStatusEnum, default: function (this: Order) {
      return this.paymentType === PaymentEnum.cash ? OrderStatusEnum.pending : OrderStatusEnum.placed
    }
  })
  status: OrderStatusEnum;

  @Prop([OrderProduct])
  products: OrderProduct[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy: Types.ObjectId;
  @Prop({ type: Date, required: false })
  freezedAt: Date | undefined;
  @Prop({ type: Date, required: false })
  restoredAt?: Date | undefined;
}

export type OrderDocument = HydratedDocument<Order>;

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre("save", async function (next) {

  if (this.isModified('total')) {
    this.subTotal = this.total - (this.total * this.discount);
  }
  next();
})

OrderSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<OrderDocument>;

  if (update.name) {
    this.setUpdate({ ...update, slug: slugify(update.name) })
  }
  const query = this.getQuery();

  if (query.paranoId === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }

  next();
})



OrderSchema.pre(['findOne', 'find'], async function (next) {
  const query = this.getQuery();

  if (query.paranoId === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }

  next();
})


export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: OrderSchema },
]);
