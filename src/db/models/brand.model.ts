import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import { IBrand } from 'src/common/interfaces';

@Schema({ timestamps: true, strictQuery: true })
export class Brand implements IBrand {
  @Prop({ required: false, type: String })
  image: string;
  @Prop({ required: true, type: String, minlength: 2, maxlength: 25 })
  name: string;
  @Prop({ type: String, unique: true, minlength: 2, maxlength: 50 })
  slug: string;
  @Prop({ required: true, type: String, minlength: 2, maxlength: 25 })
  slogan: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy: Types.ObjectId;
}

export type BrandDocument = HydratedDocument<Brand>;

export const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
})


export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: BrandSchema },
]);
