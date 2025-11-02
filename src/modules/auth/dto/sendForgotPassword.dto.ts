import { IsEmail, IsNotEmpty } from "class-validator";

export class SendForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}