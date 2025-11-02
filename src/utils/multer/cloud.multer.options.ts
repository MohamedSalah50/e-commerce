import multer, { diskStorage, memoryStorage } from 'multer';
import type { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import { storageEnum } from 'src/common';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export const cloudFileUpload = ({
  storageAppraoch = storageEnum.memory,
  validation = [],
  fileSize = 2,
}: {
  storageAppraoch?: storageEnum;
  validation?: string[];
  fileSize?: number;
}) => {
  return {
    storage:
      storageAppraoch === storageEnum.memory
        ? multer.memoryStorage()
        : multer.diskStorage({
            destination: tmpdir(),
            filename: function (
              req: Request,
              file: Express.Multer.File,
              callback,
            ) {
              callback(null, `$${randomUUID()}_${file.originalname}`);
            },
          }),

    fileFilter(req: Request, file: Express.Multer.File, callback: Function) {
      if (validation.includes(file.mimetype)) {
        return callback(null, true);
      }
      return callback(new BadRequestException('invalid file type'), false);
    },

    limits: {
      fileSize: fileSize * 1024 * 1024,
    },
  };
};
