import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { tokenDocument as TDocument, Token } from '../models/token.model';
import { DatabaseRepository } from './database.repository';

@Injectable()
export class TokenRepository extends DatabaseRepository<Token> {
  constructor(
    @InjectModel(Token.name) protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
