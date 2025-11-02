import {
  Schema,
  Prop,
  SchemaFactory,
  Virtual,
  MongooseModule,
} from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from 'src/common';
import { generateHash } from 'src/utils';
import { OtpDocument } from './otp.model';
import { IUser } from 'src/common/interfaces';

export type HUserDocument = HydratedDocument<User>;

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User implements IUser {
  @Prop({ required: true, minlength: 2, maxlength: 20 })
  firstName: string;

  @Prop({ required: true, minlength: 2, maxlength: 20 })
  lastName: string;

  @Virtual({
    get: function (this: User) {
      return this.firstName + ' ' + this.lastName;
    },
    set: function (value: string) {
      const [firstName, lastName] = value.split(' ');
      this.set({ firstName, lastName });
    },
  })
  userName: string;

  @Prop({ required: true, unique: true })
  email: string;

  // @Prop()
  // confirmEmailOtp?: string;

  @Prop({
    type: Date,
    required: false,
  })
  confirmedAt?: Date;

  @Prop({
    required: function () {
      return this.provider !== ProviderEnum.Google ? true : false;
    },
  })
  password: string;

  @Prop()
  phone: string;

  @Prop({ type: Date })
  freezedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  freezedBy?: Types.ObjectId;

  @Prop({ type: Date })
  restoredAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  restoredBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: ProviderEnum,
    default: ProviderEnum.System,
  })
  provider: ProviderEnum;

  @Prop({
    type: String,
    enum: GenderEnum,
    default: GenderEnum.male,
  })
  gender: GenderEnum;

  @Prop({ type: String, enum: RoleEnum, default: RoleEnum.user })
  role: RoleEnum;
  @Prop()
  resetPasswordOtp?: string;

  @Prop({ type: Date, required: false })
  changeCredentialsTime?: Date;

  @Prop({
    type: String,
    enum: LanguageEnum,
    default: LanguageEnum.en,
  })
  prefferedLanguage: LanguageEnum;

  @Prop({ type: String })
  profilePicture?: string;

  @Virtual()
  otp: OtpDocument[];
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('otp', {
  localField: '_id',
  foreignField: 'createdBy',
  ref: 'Otp',
});

UserSchema.pre('save', async function (next) {
  if (this.isModified('password'))
    this.password = await generateHash(this.password);

  next();
});

export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
