import { Injectable } from '@nestjs/common';
import { storageEnum } from 'src/common';
import { S3Service } from 'src/common/services';
import type { UserDocument } from 'src/db';

@Injectable()
export class UserService {
  constructor(private readonly s3service: S3Service) {}

  async profileImage(
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<string> {
    user.profilePicture = await this.s3service.uploadFile({
      file,
      storageAppraoch: storageEnum.disk,
      path: `user/${user._id.toString()}`,
    });
    await user.save();
    return user.profilePicture;
  }
}
