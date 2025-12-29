import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ApiPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contentTypeApiId: string;

  @Column()
  endpoint: string;

  @Column()
  method: string;

  @Column("text", { array: true })
  allowedRoles: string[];
}

@Entity()
export class ContentPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  contentTypeApiId: string;

  @Column()
  action: string;

  @Column("text", { array: true })
  allowedRoles: string[];
}