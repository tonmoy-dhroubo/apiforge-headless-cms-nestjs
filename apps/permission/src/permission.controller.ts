import { Controller, Post, Body } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiResponse } from '@app/common';

@Controller('api/permissions')
export class PermissionController {
  constructor(private service: PermissionService) {}

  @Post('api')
  async createApiPermission(@Body() dto: any) {
    return ApiResponse.success(await this.service.createApiPermission(dto));
  }

  @Post('content')
  async createContentPermission(@Body() dto: any) {
    return ApiResponse.success(await this.service.createContentPermission(dto));
  }

  @Post('api/check')
  async checkApi(@Body() body: { apiId: string, method: string, roles: string[] }) {
    const allowed = await this.service.checkApiPermission(body.apiId, body.method, body.roles);
    return ApiResponse.success(allowed);
  }
}