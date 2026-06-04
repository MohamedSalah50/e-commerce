import { Injectable, NotFoundException } from '@nestjs/common';
import { storageEnum } from 'src/common';
import { S3Service } from 'src/common/services';
import { type UserDocument, UserRepository } from 'src/db';
import { Lean } from 'src/db/repository/database.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly s3service: S3Service) { }


  async profile(user: UserDocument): Promise<UserDocument | Lean<UserDocument>> {
    const profile = await this.userRepository.findOne({
      filter: { _id: user._id },
      options: { populate: [{ path: 'wishList' }] }
    });

    if (!profile) {
      throw new NotFoundException('user not found')
    }

    return profile
  }

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
