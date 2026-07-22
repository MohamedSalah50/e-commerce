/* eslint-disable no-unused-vars */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { roleName } from 'src/common/decorators/role.decorator';
import { RoleEnum } from 'src/common/enums';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const accessRoles: RoleEnum[] =
      this.reflector.getAllAndOverride<RoleEnum[]>(roleName, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    // console.log({ context, tokenType });

    let role: RoleEnum = RoleEnum.user;
    switch (context.getType<string>()) {
      case 'http':
        role = context.switchToHttp().getRequest().credentials.user.role;
        break;

      case 'ws':
        role = context.switchToWs().getClient().credentials.user.role;
        break;

      case 'graphql':
        role =
          GqlExecutionContext.create(context).getContext().req.credentials.user
            .role;
        break;
      default:
        break;
    }

    console.log({ accessRoles, role });

    return accessRoles.includes(role);
  }
}
