import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
// import slugify from 'slugify';
import { IBrand, ICategory } from 'src/common/interfaces';

@Schema({ timestamps: true, strictQuery: true, strict: true })
export class Category implements ICategory {
  @Prop({ required: true, type: String, minlength: 2, maxlength: 50 })
  name: string;
  @Prop({ type: String, unique: true, minlength: 2, maxlength: 50 })
  slug: string;
  @Prop({ type: String, minlength: 2, maxlength: 5000 })
  description: string;
  @Prop({ required: false, type: String })
  image: string;
  @Prop({ type: String })
  folderAssetId: string;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
  @Prop({ type: Date, required: false })
  freezedAt: Date | undefined;
  @Prop({ type: Date, required: false })
  restoredAt?: Date | undefined;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Brand' }] })
  brands?: Types.ObjectId[];
}

export type CategoryDocument = HydratedDocument<Category>;

export const CategorySchema = SchemaFactory.createForClass(Category);

// CategorySchema.pre("save", async function (next) {
//   if (this.isModified("name")) {
//     this.slug = slugify(this.name);
//   }
//   next();
// })

// CategorySchema.pre(['updateOne', 'findOneAndUpdate'], async function (next) {
//   const update = this.getUpdate() as UpdateQuery<CategoryDocument>;

//   if (update.name) {
//     this.setUpdate({ ...update, slug: slugify(update.name) })
//   }
//   const query = this.getQuery();

//   if (query.paranoId === false) {
//     this.setQuery({ ...query })
//   } else {
//     this.setQuery({ ...query, freezedAt: { $exists: false } })
//   }

//   next();
// })



// CategorySchema.pre(['findOne', 'find'], async function (next) {
//   const query = this.getQuery();

//   if (query.paranoId === false) {
//     this.setQuery({ ...query })
//   } else {
//     this.setQuery({ ...query, freezedAt: { $exists: false } })
//   }

//   next();
// })


export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema },
]);
