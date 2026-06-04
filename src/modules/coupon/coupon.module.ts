import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponModel, CouponRepository } from 'src/db';
import { S3Service } from 'src/common/services';

@Module({
  imports: [CouponModel],
  controllers: [CouponController],
  providers: [CouponService, CouponRepository, S3Service],
})
export class CouponModule { }
