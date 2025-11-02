/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import {
  LoginCredentialsResponse,
  RoleEnum,
  SignatureLevelEnum,
  tokenEnum,
} from 'src/common';
import { randomUUID } from 'crypto';
import { UserDocument, UserRepository } from 'src/db';
import { tokenDocument } from 'src/db/models/token.model';
import { TokenRepository } from 'src/db/repository/token.repository';
import { parseObjectId } from './objectId';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}
  generateToken = async ({
    payload,
    options = {
      secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    },
  }: {
    payload: object;
    options: JwtSignOptions;
  }) => {
    return this.jwtService.signAsync(payload, options);
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  verifyToken = async ({
    token,
    options = {
      secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    },
  }: {
    token: string;
    options?: JwtVerifyOptions;
  }): Promise<JwtPayload> => {
    return this.jwtService.verifyAsync(token, options) as unknown as JwtPayload;
  };

  detectSignatureLevel = async (
    role: RoleEnum = RoleEnum.user,
  ): Promise<SignatureLevelEnum> => {
    let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer;

    switch (role) {
      case RoleEnum.superAdmin:
      case RoleEnum.admin:
        signatureLevel = SignatureLevelEnum.System;
        break;
      default:
        signatureLevel = SignatureLevelEnum.Bearer;
        break;
    }
    return signatureLevel;
  };

  getSignatures = async (
    signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer,
  ): Promise<{ access_Signature: string; refresh_Signature: string }> => {
    const signatures: { access_Signature: string; refresh_Signature: string } =
      {
        access_Signature: '',
        refresh_Signature: '',
      };

    switch (signatureLevel) {
      case SignatureLevelEnum.System:
        signatures.access_Signature = process.env
          .ACCESS_SYSTEM_TOKEN_SIGNATURE as string;
        signatures.refresh_Signature = process.env
          .REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
        break;
      default:
        signatures.access_Signature = process.env
          .ACCESS_USER_TOKEN_SIGNATURE as string;
        signatures.refresh_Signature = process.env
          .REFRESH_USER_TOKEN_SIGNATURE as string;
        break;
    }
    return signatures;
  };

  createLoginCredentials = async (
    user: UserDocument,
  ): Promise<LoginCredentialsResponse> => {
    const signatureLevel = await this.detectSignatureLevel(user.role);
    const signatures = await this.getSignatures(signatureLevel);

    // console.log(signatures);
    const jwtid = randomUUID();

    const access_Token = await this.generateToken({
      payload: { sub: user._id },
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        secret: signatures.access_Signature,
        jwtid,
      },
    });
    const refresh_Token = await this.generateToken({
      payload: { sub: user._id },
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        secret: signatures.refresh_Signature,
        jwtid,
      },
    });

    return { access_Token, refresh_Token };
  };

  decodeToken = async ({
    authorization,
    tokenType = tokenEnum.access,
  }: {
    authorization: string;
    tokenType?: tokenEnum;
  }) => {
    try {
      const [bearerKey, token] = authorization.split(' ');

      if (!bearerKey || !token) {
        throw new UnauthorizedException('Missing token parts');
      }

      const signatures = await this.getSignatures(
        bearerKey as SignatureLevelEnum,
      );
      const decoded = await this.verifyToken({
        token,
        options: {
          secret:
            tokenType === tokenEnum.refresh
              ? signatures.refresh_Signature
              : signatures.access_Signature,
        },
      });
      // console.log({ decoded });

      if (!decoded?.sub || !decoded?.iat) {
        throw new BadRequestException('Invalid token payload');
      }

      if (
        decoded.jti &&
        (await this.tokenRepository.findOne({ filter: { jti: decoded.jti } }))
      ) {
        throw new UnauthorizedException('Invalid or old login credentials');
      }

      const user = (await this.userRepository.findOne({
        filter: { _id: decoded.sub },
      })) as UserDocument;
      if (!user) {
        throw new BadRequestException('not registered account');
      }

      if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new UnauthorizedException('Invalid or old login credentials');
      }

      return { user, decoded };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'something went wrong',
      );
    }
  };

  createRevokeToken = async (decoded: JwtPayload): Promise<tokenDocument> => {
    const [result] =
      (await this.tokenRepository.create({
        data: [
          {
            jti: decoded.jti as string,
            expiredAt: new Date(
              (decoded.iat as number) +
                Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
            ),
            createdBy: parseObjectId(decoded.sub as string),
          },
        ],
      })) || [];
    if (!result) {
      throw new BadRequestException('fail to revoke this token');
    }
    return result;
  };
}
