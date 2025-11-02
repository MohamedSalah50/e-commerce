import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument as TDocument, User } from '../models/user.model';
import { DatabaseRepository } from './database.repository';

@Injectable()
export class UserRepository extends DatabaseRepository<User> {
  constructor(
    @InjectModel(User.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
