import { NestFactory } from '@nestjs/core';
import { PermissionModule } from './permission.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(PermissionModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(7085);
  console.log('Permission Service running on 7085');
}
bootstrap();