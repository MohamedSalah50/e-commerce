/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable prefer-const */
import { diskStorage } from 'multer';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { IMulterFile } from '../../common/interfaces/multer.interface';
import { BadRequestException } from '@nestjs/common';

export const localFileUpload = ({
  folder = 'public',
  validation = [],
  fileSize = 2,
}: {
  folder?: string;
  validation?: string[];
  fileSize?: number;
}) => {
  let basePath = `uploads/${folder}`;

  return {
    storage: diskStorage({
      destination(req: Request, file: Express.Multer.File, callback: Function) {
        const fullPath = path.resolve(`./${basePath}`);

        if (!existsSync(fullPath)) {
          mkdirSync(fullPath, { recursive: true });
        }

        callback(null, fullPath);
      },

      filename(req: Request, file: IMulterFile, callback: Function) {
        const fileName =
          randomUUID() + '_' + Date.now() + '_' + file.originalname;

        file.finalPath = `${basePath}/${fileName}`;
        callback(null, fileName);
      },
    }),

    fileFilter(req: Request, file: Express.Multer.File, callback: Function) {
      if (validation.includes(file.mimetype)) {
        return callback(null, true);
      }
      return callback(new BadRequestException('invalid file type'), false);
    },

    limits:{
      fileSize: fileSize * 1024 * 1024
    }
  };
};
