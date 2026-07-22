/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { tokenName } from 'src/common/decorators';
import { tokenEnum } from 'src/common/enums';
import { getSocketAuth } from 'src/utils/security/socket.security';
import { TokenService } from 'src/utils/security/token.security';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokensService: TokenService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType: tokenEnum =
      this.reflector.getAllAndOverride<tokenEnum>(tokenName, [
        context.getHandler(),
        context.getClass(),
      ]) ?? tokenEnum.access;

    // console.log({ context, tokenType });

    let req: any;
    let authorization: string = '';
    switch (context.getType<string>()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization;
        break;
      case 'ws':
        const wsCtx = context.switchToWs();
        req = wsCtx.getClient();
        authorization = getSocketAuth(req);
        console.log(authorization);
        break;
      case 'graphql':
        const graph_ctx = GqlExecutionContext.create(context).getContext().req;
        authorization = req.headers.authorization;
        break;
      default:
        break;
    }
    const { user, decoded } = await this.tokensService.decodeToken({
      authorization,
      tokenType: tokenEnum.access,
    });

    req.credentials = { user, decoded };
    return true;
  }
}
