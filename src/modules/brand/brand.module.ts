import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandRepository, TokenRepository } from 'src/db';
import { S3Service } from 'src/common/services';
import { SharedAuthenticationModule } from 'src/common/modules/auth.module';
import { JwtService } from '@nestjs/jwt';
import { authModule } from '../auth/auth.module';

@Module({
  imports: [BrandModel,SharedAuthenticationModule,authModule],
  controllers: [BrandController],
  providers: [BrandService, BrandRepository, S3Service , JwtService,TokenRepository],
})
export class BrandModule { }
