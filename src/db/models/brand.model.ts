import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
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
  @Prop({ type: Date, required: false })
  freezedAt: Date | undefined;
  @Prop({ type: Date, required: false })
  restoredAt?: Date | undefined;
}

export type BrandDocument = HydratedDocument<Brand>;

export const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.pre("save",  function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
  next();
})

BrandSchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
  const update = this.getUpdate() as UpdateQuery<BrandDocument>;

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



BrandSchema.pre(['findOne', 'find'], async function (next) {
  const query = this.getQuery();

  if (query.paranoId === false) {
    this.setQuery({ ...query })
  } else {
    this.setQuery({ ...query, freezedAt: { $exists: false } })
  }

  next();
})


export const BrandModel = MongooseModule.forFeature([
  { name: Brand.name, schema: BrandSchema },
]);
