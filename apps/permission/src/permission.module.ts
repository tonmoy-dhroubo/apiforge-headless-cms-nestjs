import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { ApiPermission, ContentPermission } from './permission.entity';
import { AuthCommonModule } from '@app/common/auth/auth-common.module';

@Module({
  imports: [
    DatabaseModule.forRoot([ApiPermission, ContentPermission], true),
    TypeOrmModule.forFeature([ApiPermission, ContentPermission]),
    AuthCommonModule,
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}