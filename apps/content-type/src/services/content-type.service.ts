import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
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

  private mapFieldType(type?: string): string {
    if (!type) return 'SHORT_TEXT';
    const normalized = type.toUpperCase();
    const knownTypes = new Set([
      'SHORT_TEXT',
      'LONG_TEXT',
      'RICH_TEXT',
      'NUMBER',
      'BOOLEAN',
      'DATETIME',
      'MEDIA',
      'RELATION',
    ]);
    if (knownTypes.has(normalized)) {
      return normalized;
    }
    const typeMap: Record<string, string> = {
      'string': 'SHORT_TEXT',
      'text': 'LONG_TEXT',
      'boolean': 'BOOLEAN',
      'number': 'NUMBER',
      'datetime': 'DATETIME',
    };
    return typeMap[type.toLowerCase()] || 'SHORT_TEXT';
  }

  async create(dto: any) {
    try {
      const exists = await this.repo.findOne({ where: { apiId: dto.apiId } });
      if(exists) throw new ConflictException('API ID Exists');

      // Create Field entities from dto.fields
      const fields = (dto.fields || []).map((f: any) => {
        const field = new Field();
        field.name = f.name || f.fieldName;
        field.fieldName = f.fieldName || f.name;
        field.type = this.mapFieldType(f.type);
        field.required = f.required || false;
        field.unique = f.unique || false;
        field.targetContentType = f.targetContentType ?? null;
        field.relationType = f.relationType ?? null;
        return field;
      });

      // Prepare fields for dynamic table creation
      const tableFields = fields.map(f => ({
        fieldName: f.fieldName,
        type: f.type,
        required: f.required,
        unique: f.unique
      }));

      // Create the dynamic table first
      await this.dynamicTableService.createTable(dto.apiId, tableFields);

      // Create ContentType with fields
      const contentType = this.repo.create({
        name: dto.name,
        pluralName: dto.pluralName || `${dto.name}s`,
        apiId: dto.apiId,
        description: dto.description,
        fields: fields
      });

      return await this.repo.save(contentType);
    } catch (error) {
      console.error('ContentType creation error:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(`Failed to create content type: ${error.message}`);
    }
  }

  async findAll() {
    return this.repo.find({ relations: ['fields'] });
  }

  async findById(id: number) {
    const contentType = await this.repo.findOne({ where: { id }, relations: ['fields'] });
    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }
    return contentType;
  }

  async findByApiId(apiId: string) {
    const contentType = await this.repo.findOne({ where: { apiId }, relations: ['fields'] });
    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }
    return contentType;
  }

  async update(id: number, dto: any) {
    const contentType = await this.repo.findOne({ where: { id }, relations: ['fields'] });
    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }

    contentType.name = dto.name ?? contentType.name;
    contentType.pluralName = dto.pluralName ?? contentType.pluralName;
    contentType.description = dto.description ?? contentType.description;

    if (dto.fields) {
      const fields = dto.fields.map((f: any) => {
        const field = new Field();
        field.id = f.id;
        field.name = f.name || f.fieldName;
        field.fieldName = f.fieldName || f.name;
        field.type = this.mapFieldType(f.type);
        field.required = f.required || false;
        field.unique = f.unique || false;
        field.targetContentType = f.targetContentType ?? null;
        field.relationType = f.relationType ?? null;
        return field;
      });
      contentType.fields = fields;
    }

    return this.repo.save(contentType);
  }

  async delete(id: number) {
    const contentType = await this.repo.findOne({ where: { id } });
    if (!contentType) {
      throw new NotFoundException('Content type not found');
    }
    await this.dynamicTableService.dropTable(contentType.apiId);
    await this.repo.remove(contentType);
  }
}
