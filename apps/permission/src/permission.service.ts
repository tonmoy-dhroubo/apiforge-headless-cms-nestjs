import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiPermission, ContentPermission } from './permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(ApiPermission) private apiRepo: Repository<ApiPermission>,
    @InjectRepository(ContentPermission) private contentRepo: Repository<ContentPermission>,
  ) {}

  async createApiPermission(dto: any) {
    try {
      const permission = this.apiRepo.create(dto);
      return await this.apiRepo.save(permission);
    } catch (error) {
      throw new Error(`Failed to create API permission: ${error.message}`);
    }
  }

  async createContentPermission(dto: any) {
    try {
      // Map contentId to action if provided
      if (dto.contentId && !dto.action) {
        dto.action = `content:${dto.contentId}`;
      }
      const permission = this.contentRepo.create(dto);
      return await this.contentRepo.save(permission);
    } catch (error) {
      throw new Error(`Failed to create content permission: ${error.message}`);
    }
  }

  async checkApiPermission(apiId: string, method: string, userRoles: string[]) {
    const permission = await this.apiRepo.findOne({
      where: { contentTypeApiId: apiId, method }
    });
    
    if (!permission) return false; 

    return permission.allowedRoles.some(r => userRoles.includes(r));
  }
}