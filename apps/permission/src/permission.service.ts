import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ApiPermission,
  ApiPermissionRole,
  ContentPermission,
  ContentPermissionRole,
} from './permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(ApiPermission) private apiRepo: Repository<ApiPermission>,
    @InjectRepository(ApiPermissionRole) private apiRoleRepo: Repository<ApiPermissionRole>,
    @InjectRepository(ContentPermission) private contentRepo: Repository<ContentPermission>,
    @InjectRepository(ContentPermissionRole) private contentRoleRepo: Repository<ContentPermissionRole>,
  ) {}

  private async mapApiRoles(permissionIds: number[]) {
    if (permissionIds.length === 0) return new Map<number, string[]>();
    const roles = await this.apiRoleRepo.find({ where: { permissionId: In(permissionIds) } });
    const map = new Map<number, string[]>();
    roles.forEach((role) => {
      const existing = map.get(role.permissionId) || [];
      existing.push(role.roleName);
      map.set(role.permissionId, existing);
    });
    return map;
  }

  private async mapContentRoles(permissionIds: number[]) {
    if (permissionIds.length === 0) return new Map<number, string[]>();
    const roles = await this.contentRoleRepo.find({ where: { permissionId: In(permissionIds) } });
    const map = new Map<number, string[]>();
    roles.forEach((role) => {
      const existing = map.get(role.permissionId) || [];
      existing.push(role.roleName);
      map.set(role.permissionId, existing);
    });
    return map;
  }

  async createApiPermission(dto: any) {
    try {
      const permission = this.apiRepo.create({
        contentTypeApiId: dto.contentTypeApiId,
        endpoint: dto.endpoint,
        method: dto.method,
      });
      const saved = await this.apiRepo.save(permission);

      const roles = (dto.allowedRoles || []).map((roleName: string) =>
        this.apiRoleRepo.create({ permissionId: saved.id, roleName }),
      );
      if (roles.length) {
        await this.apiRoleRepo.save(roles);
      }

      return { ...saved, allowedRoles: dto.allowedRoles || [] };
    } catch (error) {
      throw new Error(`Failed to create API permission: ${error.message}`);
    }
  }

  async getAllApiPermissions() {
    const permissions = await this.apiRepo.find();
    const rolesMap = await this.mapApiRoles(permissions.map((p) => p.id));
    return permissions.map((permission) => ({
      ...permission,
      allowedRoles: rolesMap.get(permission.id) || [],
    }));
  }

  async getApiPermissionById(id: number) {
    const permission = await this.apiRepo.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException('API permission not found');
    }
    const rolesMap = await this.mapApiRoles([id]);
    return { ...permission, allowedRoles: rolesMap.get(id) || [] };
  }

  async getApiPermissionsByContentType(contentTypeApiId: string) {
    const permissions = await this.apiRepo.find({ where: { contentTypeApiId } });
    const rolesMap = await this.mapApiRoles(permissions.map((p) => p.id));
    return permissions.map((permission) => ({
      ...permission,
      allowedRoles: rolesMap.get(permission.id) || [],
    }));
  }

  async updateApiPermission(id: number, dto: any) {
    const permission = await this.apiRepo.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException('API permission not found');
    }
    permission.contentTypeApiId = dto.contentTypeApiId ?? permission.contentTypeApiId;
    permission.endpoint = dto.endpoint ?? permission.endpoint;
    permission.method = dto.method ?? permission.method;
    const saved = await this.apiRepo.save(permission);

    await this.apiRoleRepo.delete({ permissionId: id });
    const roles = (dto.allowedRoles || []).map((roleName: string) =>
      this.apiRoleRepo.create({ permissionId: id, roleName }),
    );
    if (roles.length) {
      await this.apiRoleRepo.save(roles);
    }
    return { ...saved, allowedRoles: dto.allowedRoles || [] };
  }

  async deleteApiPermission(id: number) {
    await this.apiRoleRepo.delete({ permissionId: id });
    await this.apiRepo.delete({ id });
  }

  async checkApiPermission(contentTypeApiId: string, endpoint: string, method: string, userRoles: string[]) {
    const permission = await this.apiRepo.findOne({ where: { contentTypeApiId, endpoint, method } });
    if (!permission) return false;
    const roles = await this.apiRoleRepo.find({ where: { permissionId: permission.id } });
    return roles.some((role) => userRoles.includes(role.roleName));
  }

  async createContentPermission(dto: any) {
    try {
      const permission = this.contentRepo.create({
        contentTypeApiId: dto.contentTypeApiId,
        action: dto.action,
      });
      const saved = await this.contentRepo.save(permission);
      const roles = (dto.allowedRoles || []).map((roleName: string) =>
        this.contentRoleRepo.create({ permissionId: saved.id, roleName }),
      );
      if (roles.length) {
        await this.contentRoleRepo.save(roles);
      }
      return { ...saved, allowedRoles: dto.allowedRoles || [] };
    } catch (error) {
      throw new Error(`Failed to create content permission: ${error.message}`);
    }
  }

  async getAllContentPermissions() {
    const permissions = await this.contentRepo.find();
    const rolesMap = await this.mapContentRoles(permissions.map((p) => p.id));
    return permissions.map((permission) => ({
      ...permission,
      allowedRoles: rolesMap.get(permission.id) || [],
    }));
  }

  async getContentPermissionById(id: number) {
    const permission = await this.contentRepo.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException('Content permission not found');
    }
    const rolesMap = await this.mapContentRoles([id]);
    return { ...permission, allowedRoles: rolesMap.get(id) || [] };
  }

  async getContentPermissionsByContentType(contentTypeApiId: string) {
    const permissions = await this.contentRepo.find({ where: { contentTypeApiId } });
    const rolesMap = await this.mapContentRoles(permissions.map((p) => p.id));
    return permissions.map((permission) => ({
      ...permission,
      allowedRoles: rolesMap.get(permission.id) || [],
    }));
  }

  async updateContentPermission(id: number, dto: any) {
    const permission = await this.contentRepo.findOne({ where: { id } });
    if (!permission) {
      throw new NotFoundException('Content permission not found');
    }
    permission.contentTypeApiId = dto.contentTypeApiId ?? permission.contentTypeApiId;
    permission.action = dto.action ?? permission.action;
    const saved = await this.contentRepo.save(permission);
    await this.contentRoleRepo.delete({ permissionId: id });
    const roles = (dto.allowedRoles || []).map((roleName: string) =>
      this.contentRoleRepo.create({ permissionId: id, roleName }),
    );
    if (roles.length) {
      await this.contentRoleRepo.save(roles);
    }
    return { ...saved, allowedRoles: dto.allowedRoles || [] };
  }

  async deleteContentPermission(id: number) {
    await this.contentRoleRepo.delete({ permissionId: id });
    await this.contentRepo.delete({ id });
  }

  async checkContentPermission(contentTypeApiId: string, action: string, userRoles: string[]) {
    const permission = await this.contentRepo.findOne({ where: { contentTypeApiId, action } });
    if (!permission) return false;
    const roles = await this.contentRoleRepo.find({ where: { permissionId: permission.id } });
    return roles.some((role) => userRoles.includes(role.roleName));
  }
}
