import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DynamicContentService } from './dynamic-content.service';
import { ApiResponse } from '@app/common';
import { JwtAuthGuard } from '@app/common/auth/jwt-auth.guard';

@Controller('api/content/:apiId')
// @UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private service: DynamicContentService) {}

  @Post()
  async create(@Param('apiId') apiId: string, @Body() body: any) {
    const result = await this.service.create(apiId, body);
    return ApiResponse.success(result, 'Content created successfully');
  }

  @Get()
  async findAll(@Param('apiId') apiId: string) {
    const result = await this.service.findAll(apiId, {});
    return ApiResponse.success(result);
  }

  @Post('search')
  async search(@Param('apiId') apiId: string, @Body() filters: any) {
    const result = await this.service.findAll(apiId, filters);
    return ApiResponse.success(result);
  }

  @Get(':id')
  async findOne(@Param('apiId') apiId: string, @Param('id') id: number) {
    const result = await this.service.findOne(apiId, id);
    return ApiResponse.success(result);
  }

  @Put(':id')
  async update(@Param('apiId') apiId: string, @Param('id') id: number, @Body() body: any) {
    const result = await this.service.update(apiId, id, body);
    return ApiResponse.success(result, 'Content updated successfully');
  }

  @Delete(':id')
  async delete(@Param('apiId') apiId: string, @Param('id') id: number) {
    await this.service.delete(apiId, id);
    return ApiResponse.success(null, 'Content deleted successfully');
  }
}
