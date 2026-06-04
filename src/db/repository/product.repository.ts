import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { DatabaseRepository } from './database.repository';
import { ProductDocument as TDocument, Product } from '../models';

@Injectable()
export class ProductRepository extends DatabaseRepository<Product> {
  constructor(
    @InjectModel(Product.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
