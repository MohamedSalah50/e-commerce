import {
  Controller,
  Get,
  Patch,
  // Headers,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  // UploadedFiles,
} from '@nestjs/common';
import {
  FileInterceptor,
} from '@nestjs/platform-express';
import type { UserDocument } from 'src/db';
import { auth } from 'src/common/decorators/auth.decorator';
import { RoleEnum, storageEnum, User } from 'src/common';
import { prefferedLanguage } from 'src/common/interceptors';
import type { IMulterFile, IResponse } from 'src/common/interfaces';
import { cloudFileUpload, fileValidation } from 'src/utils/multer';
import { UserService } from './user.service';
import { ProfileResponse } from './entities/user.entity';
import { successResponse } from 'src/utils/response';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
  @UseInterceptors(prefferedLanguage)
  @auth([RoleEnum.admin, RoleEnum.user])
  @Get()
  async profile(@User() user: UserDocument): Promise<IResponse<ProfileResponse>> {
    const profile = await this.userService.profile(user);
    return successResponse<ProfileResponse>({ data: { profile } });
  }
  @UseInterceptors(
    FileInterceptor(
      'profileImage',
      cloudFileUpload({
        storageAppraoch: storageEnum.disk,
        validation: fileValidation.image,
        fileSize: 2,
      }),
    ),
  )
  @auth([RoleEnum.user])
  @Patch('profile-image')
  async profileImage(
    @User() user: UserDocument,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 2 })],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    const profile = await this.userService.profileImage(file, user);

    return { message: "done", data: { profile } };
  }

  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'profileImages', maxCount: 1 },
  //       { name: 'coverImages', maxCount: 2 },
  //     ],
  //     localFileUpload({
  //       folder: 'user',
  //       validation: fileValidation.image,
  //       fileSize: 2,
  //     }),
  //   ),
  // )
  // @auth([RoleEnum.user])
  // @Patch('image')
  // Image(
  //   @UploadedFiles(
  //     new ParseFilePipe({
  //       validators: [new MaxFileSizeValidator({ maxSize: 2 })],
  //       fileIsRequired: false,
  //     }),
  //   )
  //   files: {
  //     profileImages: Array<IMulterFile>;
  //     coverImages: Array<IMulterFile>;
  //   },
  // ) {
  //   return { message: 'Done', files };
  // }

  // @UseInterceptors(
  //   FilesInterceptor(
  //     'coverImages',
  //     2,
  //     localFileUpload({
  //       folder: 'user',
  //       validation: fileValidation.image,
  //       fileSize: 2,
  //     }),
  //   ),
  // )
  // @auth([RoleEnum.user])
  // @Patch('cover-images')
  // coverImages(
  //   @UploadedFiles(
  //     new ParseFilePipe({
  //       validators: [new MaxFileSizeValidator({ maxSize: 2 })],
  //       fileIsRequired: false,
  //     }),
  //   )
  //   files: Array<IMulterFile>,
  // ) {
  //   return { message: 'Done', files };
  // }
}
