import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DynamicContentService } from './dynamic-content.service';
import { ApiResponse } from '@app/common';

@Controller('api/content/:apiId')
export class ContentController {
  constructor(private service: DynamicContentService) {}

  @Post()
  async create(@Param('apiId') apiId: string, @Body() contentPayload: any) {
    const createdContent = await this.service.create(apiId, contentPayload);
    return ApiResponse.success(createdContent, 'Content created successfully');
  }

  @Get()
  async findAll(@Param('apiId') apiId: string) {
    const contentList = await this.service.findAll(apiId, {});
    return ApiResponse.success(contentList);
  }

  @Post('search')
  async search(@Param('apiId') apiId: string, @Body() filters: any) {
    const contentList = await this.service.findAll(apiId, filters);
    return ApiResponse.success(contentList);
  }

  @Get(':id')
  async findOne(@Param('apiId') apiId: string, @Param('id') id: number) {
    const contentEntry = await this.service.findOne(apiId, id);
    return ApiResponse.success(contentEntry);
  }

  @Put(':id')
  async update(@Param('apiId') apiId: string, @Param('id') id: number, @Body() contentPayload: any) {
    const updatedContent = await this.service.update(apiId, id, contentPayload);
    return ApiResponse.success(updatedContent, 'Content updated successfully');
  }

  @Delete(':id')
  async delete(@Param('apiId') apiId: string, @Param('id') id: number) {
    await this.service.delete(apiId, id);
    return ApiResponse.success(null, 'Content deleted successfully');
  }
}
