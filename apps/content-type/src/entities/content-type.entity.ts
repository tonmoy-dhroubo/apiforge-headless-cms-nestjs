import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Field } from './field.entity';

@Entity()
export class ContentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  pluralName: string;

  @Column({ unique: true })
  apiId: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Field, (field) => field.contentType, { cascade: true })
  fields: Field[];
}