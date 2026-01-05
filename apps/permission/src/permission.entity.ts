import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('api_permissions')
export class ApiPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'content_type_api_id' })
  contentTypeApiId: string;

  @Column()
  endpoint: string;

  @Column()
  method: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('api_permission_roles')
export class ApiPermissionRole {
  @PrimaryColumn({ name: 'permission_id', type: 'bigint' })
  permissionId: number;

  @PrimaryColumn({ name: 'role_name' })
  roleName: string;
}

@Entity('content_permissions')
export class ContentPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'content_type_api_id' })
  contentTypeApiId: string;

  @Column()
  action: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('content_permission_roles')
export class ContentPermissionRole {
  @PrimaryColumn({ name: 'permission_id', type: 'bigint' })
  permissionId: number;

  @PrimaryColumn({ name: 'role_name' })
  roleName: string;
}
