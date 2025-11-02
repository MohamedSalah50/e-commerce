import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class resendConfirmEmailDto {
  @IsEmail()
  email: string;
}

export class LoginDto extends resendConfirmEmailDto {
  @IsStrongPassword()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
