import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { ApiPermission, ApiPermissionRole, ContentPermission, ContentPermissionRole } from './permission.entity';
import { AuthCommonModule } from '@app/common/auth/auth-common.module';

@Module({
  imports: [
    DatabaseModule.forRoot([ApiPermission, ApiPermissionRole, ContentPermission, ContentPermissionRole], false),
    TypeOrmModule.forFeature([ApiPermission, ApiPermissionRole, ContentPermission, ContentPermissionRole]),
    AuthCommonModule,
  ],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
