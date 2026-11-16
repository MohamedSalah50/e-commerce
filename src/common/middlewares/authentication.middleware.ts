import { Injectable, NestMiddleware } from '@nestjs/common';
import { IAuthRequest } from '../interfaces';
import { NextFunction } from 'express';
import { TokenService } from 'src/utils/security/token.security';
import { tokenEnum } from '../enums';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}
  async use(req: IAuthRequest, res: Response, next: NextFunction) {
    console.log('request...');
    console.log(req.headers.authorization);

    const { user, decoded } = await this.tokenService.decodeToken({
      authorization: req.headers.authorization ?? '',
      tokenType: req.tokenType as tokenEnum,
    });

    req.credentials = { user, decoded };
    next();
  }
}
