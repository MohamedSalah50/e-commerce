import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { GenderEnum, IsMatched } from 'src/common';

@ValidatorConstraint({ name: 'MatchBetweenFields', async: false })
export class MatchBetweenFields implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    return value === args.object['password'];
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'password and confirmPassword mismatched';
  }
}

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

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @IsStrongPassword()
  password: string;

  @IsString()
  @MinLength(6)
  @ValidateIf((data: SignupDto) => {
    return Boolean(data.password);
  })
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
