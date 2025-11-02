import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { S3Service } from './common/services';

import { promisify } from 'node:util';
import { pipeline } from 'node:stream';

const s3WriteStreamPipeline = promisify(pipeline);
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3service: S3Service,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/upload/pre-signed/:path')
  async getPresignedAssetUrl(
    @Query() query: { download?: 'true' | 'false'; filename?: string },
    @Param() params: { path: string[] },
  ) {
    const { download, filename } = query;
    const { path } = params;
    const Key = path.join('/');

    const url = await this.s3service.createGetSignedLink({
      Key,
      download,
      filename,
    });

    return { message: 'Done', data: { url } };
  }

  @Get('/upload/*path')
  async getAsset(
    @Query() query: { download?: 'true' | 'false'; filename?: string },
    @Param() params: { path: string[] },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { download, filename } = query;
    const { path } = params;
    const Key = path.join('/');

    const s3Response = await this.s3service.getFile({ key: Key });
    // console.log(s3Response);

    if (!s3Response?.Body) {
      throw new BadRequestException('fail to fetch this asset');
    }

    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-type', `${s3Response.ContentType}`);

    if (download === 'true') {
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename || Key.split('/').pop()}"`,
      );
      // only apply it for download
    }

    return await s3WriteStreamPipeline(
      s3Response.Body as NodeJS.ReadableStream,
      res,
    );
  }
}
