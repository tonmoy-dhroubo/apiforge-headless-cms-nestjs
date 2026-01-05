import { Controller, Post, Get, Body, Param, Put, Delete } from '@nestjs/common';
import { ContentTypeService } from './services/content-type.service';
import { ApiResponse } from '@app/common';

@Controller('api/content-types')
export class ContentTypeController {
  constructor(private service: ContentTypeService) {}

  @Post()
  async create(@Body() dto: any) {
    const res = await this.service.create(dto);
    return ApiResponse.success(res, 'Content type created successfully');
  }

  @Get()
  async findAll() {
    return ApiResponse.success(await this.service.findAll());
  }

  @Get(':id')
  async findById(@Param('id') id: number) {
    return ApiResponse.success(await this.service.findById(Number(id)));
  }

  @Get('api-id/:apiId')
  async findByApiId(@Param('apiId') apiId: string) {
    return ApiResponse.success(await this.service.findByApiId(apiId));
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() dto: any) {
    const updated = await this.service.update(Number(id), dto);
    return ApiResponse.success(updated, 'Content type updated successfully');
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.service.delete(Number(id));
    return ApiResponse.success(null, 'Content type deleted successfully');
  }
}
