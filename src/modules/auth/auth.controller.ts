import {
  Body,
  Controller,
  Patch,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { ConfirmEmailDto } from './dto/confirmEmail.dto';
import { LoginDto, resendConfirmEmailDto } from './dto/login.dto';
import { SendForgotPasswordDto } from './dto/sendForgotPassword.dto';
import { ResetForgotPasswordDto } from './dto/resetForgetPassword.dto';
import { LoginResponse } from './entities/auth.entity';
import { AuthenticationGuard } from 'src/common/guards/authentication/guard.authentication';
import { IResponse, type IAuthRequest } from 'src/common/interfaces';
import { RoleEnum } from 'src/common';
import { auth } from 'src/common/decorators/auth.decorator';
import { successResponse } from 'src/utils/response';

@Controller('auth')
export class  AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  async signup(
    @Body(
      new ValidationPipe({
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: SignupDto,
  ): Promise<IResponse> {
    await this.authService.signup(dto);
    return successResponse()
  }

  @Patch('/confirm-email')
  async confirmEmail(
    @Body(
      new ValidationPipe({
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: ConfirmEmailDto,
  ): Promise<IResponse> {
    await this.authService.confirmEmail(dto);
    return successResponse()
  }

  @Post('/resend-confirm-email')
  async resendConfirmEmail(
    @Body()
    dto: resendConfirmEmailDto,
  ) {
    await this.authService.resendConfirmEmail(dto);
    return successResponse()
  }

  @Post('/login')
  async login(
    @Body(
      new ValidationPipe({
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: LoginDto,
  ): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authService.login(dto);
    return successResponse<LoginResponse>({ message: 'done', data: { credentials } });
  }

  @auth([RoleEnum.admin, RoleEnum.user])
  @Post('/send/forgot/password')
  async sendForgotPassword(
    @Request() req: IAuthRequest,
    @Body(
      new ValidationPipe({
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: SendForgotPasswordDto,
  ): Promise<IResponse> {
    await this.authService.sendForgotPassword(dto);
    return successResponse()
  }

  @UseGuards(AuthenticationGuard)
  @Post('/reset/forgot/password')
  async resetForgotPassword(
    @Request() req,
    @Body(
      new ValidationPipe({
        stopAtFirstError: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )
    dto: ResetForgotPasswordDto,
  ): Promise<IResponse> {
    await this.authService.resetForgotPassword(dto);
    return successResponse()
  }
}
