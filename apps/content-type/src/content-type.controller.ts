import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ContentTypeService } from './services/content-type.service';
import { ApiResponse } from '@app/common';

@Controller('api/content-types')
export class ContentTypeController {
  constructor(private service: ContentTypeService) {}

  @Post()
  async create(@Body() dto: any) {
    const res = await this.service.create(dto);
    return ApiResponse.success(res, 'Content Type Created');
  }

  @Get()
  async findAll() {
    return ApiResponse.success(await this.service.findAll());
  }

  @Get('api-id/:apiId')
  async findByApiId(@Param('apiId') apiId: string) {
    return ApiResponse.success(await this.service.findByApiId(apiId));
  }
}