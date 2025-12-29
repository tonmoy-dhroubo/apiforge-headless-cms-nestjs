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
    try {
      const exists = await this.repo.findOne({ where: { apiId: dto.apiId } });
      if(exists) throw new ConflictException('API ID Exists');

      // Map field types to database types
      const mapFieldType = (type: string): string => {
        const typeMap: Record<string, string> = {
          'string': 'SHORT_TEXT',
          'text': 'LONG_TEXT',
          'boolean': 'BOOLEAN',
          'number': 'NUMBER',
          'datetime': 'DATETIME',
        };
        return typeMap[type.toLowerCase()] || 'SHORT_TEXT';
      };

      // Create Field entities from dto.fields
      const fields = (dto.fields || []).map((f: any) => {
        const field = new Field();
        field.name = f.name || f.fieldName;
        field.fieldName = f.fieldName || f.name;
        field.type = mapFieldType(f.type);
        field.required = f.required || false;
        field.unique = f.unique || false;
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

  async findByApiId(apiId: string) {
    return this.repo.findOne({ where: { apiId }, relations: ['fields'] });
  }
}