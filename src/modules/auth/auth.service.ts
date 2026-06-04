import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { generateOtp } from 'src/utils/otp';

import { ConfirmEmailDto } from './dto/confirmEmail.dto';
import { LoginDto, resendConfirmEmailDto } from './dto/login.dto';
import { SendForgotPasswordDto } from './dto/sendForgotPassword.dto';
import { ResetForgotPasswordDto } from './dto/resetForgetPassword.dto';
import { OtpRepository, UserDocument, UserRepository } from 'src/db';
import { compareHash, generateHash } from 'src/utils';
import { emailEmitter } from 'src/utils/email/email.event';
import { LoginCredentialsResponse, OtpEnum, ProviderEnum } from 'src/common';
import { Types } from 'mongoose';
import { TokenService } from 'src/utils/security/token.security';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private tokenService: TokenService,
  ) { }

  private async createConfirmEmailOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data: [
        {
          code: generateOtp(),
          expiredAt: new Date(Date.now() + 2 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.confirmEmail,
        },
      ],
    });
  }

  async signup(dto: SignupDto) {
    const { email, password, firstName, lastName } = dto;
    const existingUser = await this.userRepository.findOne({
      filter: { email },
    });
    if (existingUser) throw new ConflictException('user already existssss');

    const [user] = await this.userRepository.create({
      data: [
        {
          firstName,
          lastName,
          email,
          password,
        },
      ],
    });

    if (!user)
      throw new BadRequestException(
        'fail to signup this user, please try again later',
      );

    await this.createConfirmEmailOtp(user._id);

    return {
      message: 'signup successfull,please confirm your email',
    };
  }

  async resendConfirmEmail(dto: resendConfirmEmailDto) {
    const { email } = dto;
    const user = await this.userRepository.findOne({
      filter: { email, confirmedAt: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.confirmEmail } }],
      },
    });
    if (!user) throw new ConflictException('user already exists');

    if (user.otp?.length) {
      throw new ConflictException(
        `sorry we cant resend email, please wait ${user.otp[0].expiredAt.toLocaleString()} to resend`,
      );
    }

    await this.createConfirmEmailOtp(user._id);

    return {
      message: 'done',
    };
  }

  async confirmEmail(dto: ConfirmEmailDto) {
    const { email, otp } = dto;
    const user = await this.userRepository.findOne({
      filter: { email, confirmedAt: { $exists: false } },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.confirmEmail } }],
      },
    });
    if (!user) throw new ConflictException('user not found');

    if (!(user.otp?.length && (await compareHash(otp, user.otp[0].code)))) {
      throw new BadRequestException(`invalid otp`);
    }

    user.confirmedAt = new Date();
    await user.save();

    await this.otpRepository.deleteOne({
      filter: { _id: user.otp[0]._id },
    });

    return {
      message: 'done',
    };
  }

  async login(dto: LoginDto): Promise<LoginCredentialsResponse> {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt: { $exists: true },
        provider: ProviderEnum.System,
      },
    });

    if (!user) throw new NotFoundException('user not found');

    if (!(await compareHash(password, user.password)))
      throw new UnauthorizedException('invalid password');

    return await this.tokenService.createLoginCredentials(user as UserDocument);
  }

  async sendForgotPassword(dto: SendForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt: { $exists: true },
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Invalid account: not registered, not confirmed, or wrong provider',
      );
    }

    const otp = generateOtp();

    const hashedOtp = await generateHash(String(otp));

    const result = await this.userRepository.updateOne({
      filter: { email },
      update: { resetPasswordOtp: hashedOtp },
    });

    if (!result.matchedCount) {
      throw new ConflictException(
        'Failed to send reset code. Try again later.',
      );
    }

    emailEmitter.emit(OtpEnum.resetPassword, {
      to: email,
      otp,
    });

    return { message: 'Reset code sent successfully' };
  }

  async resetForgotPassword(dto: ResetForgotPasswordDto) {
    const { email, otp, password } = dto;

    const user = await this.userRepository.findOne({
      filter: { email, resetPasswordOtp: { $exists: true } },
    });

    if (!user) {
      throw new NotFoundException(
        'Invalid account: not registered, not confirmed, or missing reset code',
      );
    }

    if (!(await compareHash(otp, user.resetPasswordOtp as string))) {
      throw new ConflictException('Invalid forgot password code');
    }

    const newHashedPassword = await generateHash(password);

    const result = await this.userRepository.updateOne({
      filter: { email },
      update: {
        password: newHashedPassword,
        changeCredentialsTime: new Date(),
        $unset: { resetPasswordOtp: 1 },
      },
    });

    if (!result.matchedCount) {
      throw new ConflictException('Failed to reset password. Try again later.');
    }

    return { message: 'Password reset successfully' };
  }
}
