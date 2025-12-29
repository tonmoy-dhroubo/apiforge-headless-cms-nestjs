import { NestFactory } from '@nestjs/core';
import { ContentModule } from './content.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ContentModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(8083);
  console.log('Content CRUD Service running on 8083');
}
bootstrap();