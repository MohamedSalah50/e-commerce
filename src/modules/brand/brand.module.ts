import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { Brand, BrandRepository, BrandSchema, TokenRepository, UserRepository } from 'src/db';
import { S3Service } from 'src/common/services';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [MongooseModule.forFeature([
    { name: Brand.name, schema: BrandSchema },
  ])],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository, S3Service],
})
export class BrandModule { }
