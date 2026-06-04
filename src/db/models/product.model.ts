import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from 'src/common/interfaces/product.interface';

@Schema({ timestamps: true, strictQuery: true })
export class Product implements IProduct {

  @Prop({ required: true, type: String, minlength: 2, maxlength: 1000 })
  name: string;
  @Prop({ type: String, minlength: 2, maxlength: 50 })
  slug: string;
  @Prop({ required: true, type: String, minlength: 2, maxlength: 5000 })
  description: string;
  @Prop({ required: false, type: [String] })
  images: string[];
  @Prop({ required: true, type: String })
  assetFolderId: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  discountPrice: number;
  @Prop({ type: Number, required: true })
  salePrice: number;
  @Prop({ type: Number, required: true })
  originalPrice: number;
  @Prop({ type: Number, required: true })
  stock: number;
  @Prop({ type: Number, dafault: 0 })
  soldItems: number;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy: Types.ObjectId;
  @Prop({ type: Date, required: false })
  freezedAt: Date | undefined;
  @Prop({ type: Date, required: false })
  restoredAt?: Date | undefined;
}

export type ProductDocument = HydratedDocument<Product>;

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
})

ProductSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<ProductDocument>;

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



ProductSchema.pre(['findOne', 'find'], async function (next) {
  const query = this.getQuery();

  if (query.paranoId === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }

  next();
})


export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
