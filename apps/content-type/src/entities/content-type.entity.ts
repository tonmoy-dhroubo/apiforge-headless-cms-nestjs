import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Field } from './field.entity';

@Entity('content_types')
export class ContentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ name: 'plural_name', unique: true })
  pluralName: string;

  @Column({ name: 'api_id', unique: true })
  apiId: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Field, (field) => field.contentType, { cascade: true })
  fields: Field[];
}
