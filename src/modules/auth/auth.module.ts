import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpModel } from 'src/db/models';
import { AuthController } from './auth.controller';
import { OtpRepository } from 'src/db';


@Module({
  imports: [
    OtpModel,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpRepository,
  ],
  exports: [],
})
export class AuthModule { }
