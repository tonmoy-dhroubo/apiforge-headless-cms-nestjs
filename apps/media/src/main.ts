import { NestFactory } from '@nestjs/core';
import { MediaModule } from './media.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(MediaModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(8084);
  console.log('Media Service running on 8084');
}
bootstrap();
