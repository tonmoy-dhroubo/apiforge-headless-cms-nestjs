import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(7080);
  console.log('Gateway is running on http://localhost:7080');
}
bootstrap();
