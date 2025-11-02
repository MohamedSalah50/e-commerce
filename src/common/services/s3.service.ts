import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { storageEnum } from '../enums';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
  private s3client: S3Client;
  constructor() {
    this.s3client = new S3Client({
      region: process.env.S3_REGION as string,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY as string,
        secretAccessKey: process.env.S3_SECRET_KEY as string,
      },
    });
  }

  uploadFile = async ({
    storageAppraoch = storageEnum.memory,
    Bucket = process.env.S3_BUCKET_NAME,
    ACL = 'private',
    path = 'general',
    file,
  }: {
    storageAppraoch?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
  }): Promise<string> => {
    const command = new PutObjectCommand({
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}/_${
        file.originalname
      }` as string,
      Body:
        storageAppraoch === storageEnum.memory
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    });

    await this.s3client.send(command);

    if (!command?.input?.Key) {
      throw new BadRequestException('fail to upload this file');
    }

    return command.input.Key;
  };

  uploadLargeFile = async ({
    storageAppraoch = storageEnum.memory,
    Bucket = process.env.S3_BUCKET_NAME,
    ACL = 'private',
    path = 'general',
    file,
  }: {
    storageAppraoch?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    file: Express.Multer.File;
  }): Promise<string> => {
    const upload = new Upload({
      client: this.s3client,
      params: {
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}/_${
          file.originalname
        }` as string,
        Body:
          storageAppraoch === storageEnum.memory
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
      },
    });
    upload.on('httpUploadProgress', (progress) => {
      console.log('upload file progress is ', progress);
    });

    const { Key } = await upload.done();
    if (!Key) {
      throw new BadRequestException('fail to generate this key');
    }
    return Key;
  };

  uploadFiles = async ({
    storageAppraoch = storageEnum.memory,
    Bucket = process.env.S3_BUCKET_NAME as string,
    ACL = 'private',
    path = 'general',
    files,
    useLarge = false,
  }: {
    storageAppraoch?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
    useLarge?: boolean;
  }): Promise<string[]> => {
    let urls: string[] = [];

    if (useLarge) {
      urls = await Promise.all(
        files.map((file) => {
          return this.uploadLargeFile({
            storageAppraoch,
            Bucket,
            ACL,
            path,
            file,
          });
        }),
      );
    } else {
      urls = await Promise.all(
        files.map((file) => {
          return this.uploadFile({
            storageAppraoch,
            Bucket,
            ACL,
            path,
            file,
          });
        }),
      );
    }

    return urls;
  };

  uploadLargeFiles = async ({
    storageAppraoch = storageEnum.disk,
    Bucket = process.env.S3_BUCKET_NAME as string,
    ACL = 'private',
    path = 'general',
    files,
  }: {
    storageAppraoch?: storageEnum;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
  }): Promise<string[]> => {
    let urls: string[] = [];

    urls = await Promise.all(
      files.map((file) => {
        return this.uploadLargeFile({
          storageAppraoch,
          Bucket,
          ACL,
          path,
          file,
        });
      }),
    );

    return urls;
  };

  createSignedUploadLink = async ({
    Bucket = process.env.S3_BUCKET_NAME as string,
    path = 'general',
    expiresIn = Number(process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS),
    ContentType,
    OriginalName,
  }: {
    Bucket?: string;
    path?: string;
    expiresIn?: number;
    ContentType: string;
    OriginalName: string;
  }): Promise<{ url: string; Key: string }> => {
    const command = new PutObjectCommand({
      Bucket,
      Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}/_${OriginalName}`,
      ContentType,
    });
    const url = await getSignedUrl(this.s3client, command, { expiresIn });

    if (!url || !command?.input?.Key) {
      throw new BadRequestException('fail to create preSignedUrl');
    }
    return { url, Key: command.input.Key };
  };

  createGetSignedLink = async ({
    Bucket = process.env.S3_BUCKET_NAME as string,
    expiresIn = Number(process.env.AWS_PRE_SIGNED_URL_EXPIRES_IN_SECONDS),
    Key,
    downloadName = 'dummy',
    download = 'flase',
    filename,
  }: {
    Bucket?: string;
    expiresIn?: number;
    Key: string;
    downloadName?: string;
    download?: string;
    filename?: string | undefined;
  }): Promise<string> => {
    const command = new GetObjectCommand({
      Key,
      Bucket,
      ResponseContentDisposition:
        download === 'true'
          ? `attachment; filename=${filename || Key.split('/').pop()} `
          : undefined,
    });
    const url = await getSignedUrl(this.s3client, command, { expiresIn });

    if (!url) {
      throw new BadRequestException('fail to create this upload preSignedUrl');
    }
    return url;
  };

  getFile = async ({
    Bucket = process.env.S3_BUCKET_NAME as string,
    key,
  }: {
    Bucket?: string;
    key: string;
  }): Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({
      Key: key,
      Bucket,
    });
    return await this.s3client.send(command);
  };

  deleteFile = async ({
    Key,
    Bucket = process.env.S3_BUCKET_NAME,
  }: {
    Key: string;
    Bucket?: string;
  }) => {
    const command = new DeleteObjectCommand({
      Key,
      Bucket,
    });
    return await this.s3client.send(command);
  };

  deleteFiles = async ({
    Bucket = process.env.S3_BUCKET_NAME,
    urls,
    Quiet = false,
  }: {
    Bucket?: string;
    urls: string[];
    Quiet?: boolean;
  }): Promise<DeleteObjectsCommandOutput> => {
    const Objects = urls.map((url) => {
      return { Key: url };
    });
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects,
        Quiet,
      },
    });
    return await this.s3client.send(command);
  };

  listDirectoryFiles = async ({
    Bucket = process.env.S3_BUCKET_NAME as string,
    path,
  }: {
    Bucket?: string;
    path: string;
  }): Promise<ListObjectsCommandOutput> => {
    const command = new ListObjectsCommand({
      Bucket,
      Prefix: `${process.env.APPLICATION_NAME}/${path}`,
    });
    return await this.s3client.send(command);
  };

  deleteFolderByPrefix = async ({
    Bucket = process.env.S3_BUCKET_NAME as string,
    path,
    Quiet = false,
  }: {
    Bucket?: string;
    path: string;
    Quiet?: boolean;
  }): Promise<DeleteObjectsCommandOutput> => {
    const fileList = await this.listDirectoryFiles({
      path,
      Bucket,
    });
    if (!fileList?.Contents?.length) {
      throw new BadRequestException('empty directories');
    }

    const urls: string[] = fileList.Contents.map((file) => file.Key as string);

    return await this.deleteFiles({ urls, Bucket, Quiet });
  };
}
