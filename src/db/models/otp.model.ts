import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IOtp, IUser, OtpEnum } from "src/common";
import { emailEmitter, generateHash } from "src/utils";


@Schema({ timestamps: true })
export class Otp implements IOtp{
  @Prop({ required: true , type: String })
  code:string;
  @Prop({ required: true , type: String })
  expiredAt: Date;
  @Prop({ required: true , type: Types.ObjectId , ref: 'User' })
  createdBy: Types.ObjectId | IUser;
  @Prop({ required: true , type: String , enum: OtpEnum })
  type: OtpEnum
}

export type OtpDocument = HydratedDocument<Otp>;
export const OtpSchema  = SchemaFactory.createForClass(Otp);
OtpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });


OtpSchema.pre(
  'save',
  async function (
    this: OtpDocument & { wasNew?: boolean; plainOtp?: string },
    next,
  ) {
    this.wasNew = this.isNew;
    if (this.isModified('code')) {
      this.plainOtp = this.code;
      this.code = await generateHash(this.code);
      await this.populate([{ path: 'createdBy', select: 'email' }]);
    }
    next();
  },
);

OtpSchema.post('save', function (doc, next) {
  const that = this as OtpDocument & { wasNew?: boolean; plainOtp?: string };

  if (that.wasNew && that.plainOtp) {
    emailEmitter.emit(doc.type, {
      to: (that.createdBy as any).email,
      otp: that.plainOtp,
    });
  }
  next();
});



export const OtpModel = MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]) 




