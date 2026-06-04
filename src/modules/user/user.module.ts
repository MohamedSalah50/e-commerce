import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { S3Service } from 'src/common/services';
import { SharedAuthenticationModule } from 'src/common/modules';
import { UserModel, UserRepository } from 'src/db';
// import { UserModel } from 'src/db';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, S3Service],
})
export class UserModule { }
