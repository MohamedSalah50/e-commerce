import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';
import { GenderEnum, IsMatched } from 'src/common';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  lastName: string;

  // @IsString()
  // @IsNotEmpty()
  // @MinLength(2)
  // @MaxLength(20)
  // userName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(6)
  @IsMatched<string>(['password'], {
    message: 'password and confirmPassword mismatched',
  })
  confirmPassword: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gender?: GenderEnum;
}
