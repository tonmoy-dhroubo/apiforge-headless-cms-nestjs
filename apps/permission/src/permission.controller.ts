import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiResponse } from '@app/common';

@Controller('api/permissions')
export class PermissionController {
  constructor(private service: PermissionService) {}

  @Post('api')
  async createApiPermission(@Body() dto: any) {
    const created = await this.service.createApiPermission(dto);
    return ApiResponse.success(created, 'API permission created successfully');
  }

  @Get('api')
  async getAllApiPermissions() {
    return ApiResponse.success(await this.service.getAllApiPermissions());
  }

  @Get('api/content-type/:contentTypeApiId')
  async getApiPermissionsByContentType(@Param('contentTypeApiId') contentTypeApiId: string) {
    return ApiResponse.success(await this.service.getApiPermissionsByContentType(contentTypeApiId));
  }

  @Get('api/:id')
  async getApiPermissionById(@Param('id') id: number) {
    return ApiResponse.success(await this.service.getApiPermissionById(Number(id)));
  }

  @Put('api/:id')
  async updateApiPermission(@Param('id') id: number, @Body() dto: any) {
    const updated = await this.service.updateApiPermission(Number(id), dto);
    return ApiResponse.success(updated, 'API permission updated successfully');
  }

  @Delete('api/:id')
  async deleteApiPermission(@Param('id') id: number) {
    await this.service.deleteApiPermission(Number(id));
    return ApiResponse.success(null, 'API permission deleted successfully');
  }

  @Post('content')
  async createContentPermission(@Body() dto: any) {
    const created = await this.service.createContentPermission(dto);
    return ApiResponse.success(created, 'Content permission created successfully');
  }

  @Get('content')
  async getAllContentPermissions() {
    return ApiResponse.success(await this.service.getAllContentPermissions());
  }

  @Get('content/content-type/:contentTypeApiId')
  async getContentPermissionsByContentType(@Param('contentTypeApiId') contentTypeApiId: string) {
    return ApiResponse.success(await this.service.getContentPermissionsByContentType(contentTypeApiId));
  }

  @Get('content/:id')
  async getContentPermissionById(@Param('id') id: number) {
    return ApiResponse.success(await this.service.getContentPermissionById(Number(id)));
  }

  @Put('content/:id')
  async updateContentPermission(@Param('id') id: number, @Body() dto: any) {
    const updated = await this.service.updateContentPermission(Number(id), dto);
    return ApiResponse.success(updated, 'Content permission updated successfully');
  }

  @Delete('content/:id')
  async deleteContentPermission(@Param('id') id: number) {
    await this.service.deleteContentPermission(Number(id));
    return ApiResponse.success(null, 'Content permission deleted successfully');
  }

  @Post('api/check')
  async checkApi(@Body() body: { contentTypeApiId: string; endpoint: string; method: string; userRoles: string[] }) {
    const allowed = await this.service.checkApiPermission(
      body.contentTypeApiId,
      body.endpoint,
      body.method,
      body.userRoles,
    );
    return ApiResponse.success(allowed);
  }

  @Post('content/check')
  async checkContent(@Body() body: { contentTypeApiId: string; action: string; userRoles: string[] }) {
    const allowed = await this.service.checkContentPermission(body.contentTypeApiId, body.action, body.userRoles);
    return ApiResponse.success(allowed);
  }
}
