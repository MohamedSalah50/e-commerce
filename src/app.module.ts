import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { authModule } from './modules/auth/auth.module';
import { SharedAuthenticationModule } from './common/modules/auth.module';
import { UserModule } from './modules/user/user.module';
import { S3Service } from './common/services';
import { BrandModule } from './modules/brand/brand.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.dev'),
      isGlobal: true,
    }),

    authModule,
    UserModule,

    MongooseModule.forRoot(process.env.MONGO_URI as string, {
      connectionFactory: (connection) => {
        console.log('✅ Connected to MongoDB:', connection.name);
        return connection;
      },
    }),
    // SharedAuthenticationModule,
    BrandModule,
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule { }

