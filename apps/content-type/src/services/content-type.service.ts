import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentType } from '../entities/content-type.entity';
import { Field } from '../entities/field.entity';
import { DynamicTableService } from './dynamic-table.service';

@Injectable()
export class ContentTypeService {
  constructor(
    @InjectRepository(ContentType) private repo: Repository<ContentType>,
    private dynamicTableService: DynamicTableService
  ) {}

  async create(dto: any) {
    const exists = await this.repo.findOne({ where: { apiId: dto.apiId } });
    if(exists) throw new ConflictException('API ID Exists');

    const contentType = this.repo.create(dto);
    
    await this.dynamicTableService.createTable(dto.apiId, dto.fields);

    return this.repo.save(contentType);
  }

  async findAll() {
    return this.repo.find({ relations: ['fields'] });
  }

  async findByApiId(apiId: string) {
    return this.repo.findOne({ where: { apiId }, relations: ['fields'] });
  }
}