import { NestFactory } from '@nestjs/core';
import { ContentTypeModule } from './content-type.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(ContentTypeModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(8082);
  console.log('Content Type Service running on 8082');
}
bootstrap();