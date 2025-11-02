import { Types } from "mongoose";
import { GenderEnum, LanguageEnum, ProviderEnum, RoleEnum } from "../enums";
import { OtpDocument } from "src/db";

export interface IUser {
    _id?: Types.ObjectId;


    firstName: string;

    lastName: string;


    userName?: string;

    email: string;



    confirmedAt?: Date;


    password?: string;

    phone: string;

    freezedAt?: Date;

    freezedBy?: Types.ObjectId;

    restoredAt?: Date;

    restoredBy: Types.ObjectId;


    provider: ProviderEnum;


    gender: GenderEnum;

    role: RoleEnum;


    resetPasswordOtp?: string;

    changeCredentialsTime?: Date;


    prefferedLanguage: LanguageEnum;

    profilePicture?: string;

    otp?: OtpDocument[];


    createdAt?: Date;
    updatedAt?: Date;
}