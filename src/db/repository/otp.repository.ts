import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OtpDocument as TDocument, Otp } from '../models/otp.model';
import { DatabaseRepository } from './database.repository';

@Injectable()
export class OtpRepository extends DatabaseRepository<Otp> {
  constructor(
    @InjectModel(Otp.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
