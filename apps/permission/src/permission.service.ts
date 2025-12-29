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
    return this.apiRepo.save(this.apiRepo.create(dto));
  }

  async createContentPermission(dto: any) {
    return this.contentRepo.save(this.contentRepo.create(dto));
  }

  async checkApiPermission(apiId: string, method: string, userRoles: string[]) {
    const permission = await this.apiRepo.findOne({
      where: { contentTypeApiId: apiId, method }
    });
    
    if (!permission) return false; 

    return permission.allowedRoles.some(r => userRoles.includes(r));
  }
}