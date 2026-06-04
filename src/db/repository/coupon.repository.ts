import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DatabaseRepository } from './database.repository';
import { Coupon, CouponDocument as TDocument } from '../models';

@Injectable()
export class CouponRepository extends DatabaseRepository<Coupon> {
  constructor(
    @InjectModel(Coupon.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
