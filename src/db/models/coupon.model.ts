import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { CouponEnum } from 'src/common/enums/coupon.enum';
import { ICoupon, IUser } from 'src/common/interfaces';

@Schema({ timestamps: true, strictQuery: true })
export class Coupon implements ICoupon {
  @Prop({ required: true, type: String, minlength: 2, maxlength: 25 })
  name: string;
  @Prop({ type: String, unique: true, minlength: 2, maxlength: 50 })
  slug: string;
  @Prop({ required: false, type: String })
  image: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  usedBy?: Types.ObjectId[];

  @Prop({ type: Number, required: true })
  discount: number;
  @Prop({ type: Number, default: 1 })
  duration: number;
  @Prop({ type: String, enum: CouponEnum, default: CouponEnum.percent })
  type: CouponEnum;
  @Prop({ type: Date, required: true })
  startDate: Date;
  @Prop({ type: Date, required: true })
  endDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy: Types.ObjectId;
  @Prop({ type: Date, required: false })
  freezedAt: Date | undefined;
  @Prop({ type: Date, required: false })
  restoredAt?: Date | undefined;
}

export type CouponDocument = HydratedDocument<Coupon>;

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
})

CouponSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<CouponDocument>;

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



CouponSchema.pre(['findOne', 'find'], async function (next) {
  const query = this.getQuery();

  if (query.paranoId === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }

  next();
})


export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: CouponSchema },
]);
