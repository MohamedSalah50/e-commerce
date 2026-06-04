import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BrandModel, BrandRepository, CategoryModel, CategoryRepository, ProductModel, ProductRepository, UserModel, UserRepository } from 'src/db';
import { S3Service } from 'src/common/services';

@Module({
  imports: [ProductModel, CategoryModel, BrandModel, UserModel],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, CategoryRepository, BrandRepository, UserRepository, S3Service],
})
export class ProductModule { }
