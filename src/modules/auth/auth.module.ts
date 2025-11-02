import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/db/repository/user.repository';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { OtpModel, UserModel } from 'src/db/models';
import { AuthController } from './auth.controller';
import { OtpRepository } from 'src/db';
import { TokenModel } from 'src/db/models/token.model';
import { TokenService } from 'src/utils/security/token.security';
import { TokenRepository } from 'src/db/repository/token.repository';

@Module({
  imports: [
    UserModel,
    OtpModel,
    TokenModel,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN) || 900,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    OtpRepository,
    JwtService,
    TokenService,
    TokenRepository,
  ],
  exports: [AuthService],
})
export class authModule {}
