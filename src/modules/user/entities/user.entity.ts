import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from 'src/common';
import { type IUser } from 'src/common/interfaces';

registerEnumType(RoleEnum, { name: 'RoleEnum' });
registerEnumType(ProviderEnum, { name: 'ProviderEnum' });
registerEnumType(LanguageEnum, { name: 'LanguageEnum' });
registerEnumType(GenderEnum, { name: 'GenderEnum' });

export class ProfileResponse {
  profile: IUser;
}

@ObjectType({ description: 'User' })
export class OneUserResponse implements IUser {
  @Field(() => ID)
  _id: Types.ObjectId;
  @Field(() => Date, { nullable: true })
  changeCredentialsTime?: Date;
  @Field(() => Date, { nullable: true })
  confirmedAt?: Date;
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String)
  email: string;
  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String)
  firstName: string;
  @Field(() => String)
  lastName: string;
  @Field(() => String, { nullable: true })
  userName?: string;
  @Field(() => String, { nullable: true })
  profilePicture?: string;

  @Field(() => RoleEnum)
  role: RoleEnum;
  @Field(() => GenderEnum)
  gender: GenderEnum;
  @Field(() => LanguageEnum)
  prefferedLanguage: LanguageEnum;
  @Field(() => ProviderEnum)
  provider: ProviderEnum;

  @Field(() => [ID], { nullable: true })
  wishList?: Types.ObjectId[];
  //   otp?: (Document<unknown, {}, Otp, {}, {}> &
  // Otp & { _id: Types.ObjectId } & { __v: number })[];
}
