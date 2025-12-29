import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Add body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  await app.listen(8080);
  console.log('Gateway is running on http://localhost:8080');
}
bootstrap();