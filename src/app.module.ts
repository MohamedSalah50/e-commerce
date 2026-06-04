import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { S3Service } from './common/services';
import { BrandModule } from './modules/brand/brand.module';
import { SharedAuthenticationModule } from './common/modules';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.dev'),
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      connectionFactory: (connection) => {
        console.log('✅ Connected to MongoDB:', connection.name);
        return connection;
      },
    }),
    SharedAuthenticationModule,
    AuthModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    CouponModule,
    OrderModule
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule { }

