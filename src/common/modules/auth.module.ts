import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel, UserRepository } from 'src/db';
import { TokenModel } from 'src/db/models/token.model';
import { TokenRepository } from 'src/db/repository/token.repository';
import { TokenService } from 'src/utils/security/token.security';

@Module({
  imports: [UserModel, TokenModel],
  controllers: [],
  providers: [UserRepository, TokenRepository, JwtService, TokenService],
  exports: [
    UserRepository,
    TokenRepository,
    JwtService,
    TokenService,
    UserModel,
    TokenModel,
  ],
})
export class SharedAuthenticationModule {}
