import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { UserDocument } from 'src/db';
import { IUser } from './user.interface';


export interface IToken {
  _id?: Types.ObjectId;

  jti: string;
  expiredAt: Date;

  createdBy: Types.ObjectId | IUser;

  createdAt?: Date;
  updatedAt?: Date;
}
export interface ICredentials extends Request {
  user: UserDocument;
  decoded: JwtPayload;
}

export interface IAuthRequest {
  credentials: ICredentials;
}
