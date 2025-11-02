import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors';
import * as express from 'express';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/uploads', express.static(path.resolve('./uploads')));
  app.useGlobalInterceptors(new LoggingInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
