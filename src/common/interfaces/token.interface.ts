import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { UserDocument } from 'src/db';
import { IUser } from './user.interface';
import { tokenEnum } from '../enums';
import type { Request } from 'express';


export interface IToken {
  _id?: Types.ObjectId;

  jti: string;
  expiredAt: Date;

  createdBy: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;
}
export interface ICredentials {
  user: UserDocument;
  decoded: JwtPayload;
}

export interface IAuthRequest extends Request {
  credentials: ICredentials;
  tokenType: tokenEnum
}
