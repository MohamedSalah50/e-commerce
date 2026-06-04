import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { S3Service } from 'src/common/services';
import { Brand, BrandRepository, BrandSchema, Category, CategoryRepository, CategorySchema } from 'src/db';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      // { name: Product.name, schema: ProductSchema },
      { name: Brand.name, schema: BrandSchema },
    ])
  ],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepository, BrandRepository, S3Service],
})
export class CategoryModule { }
