import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ContentType } from './content-type.entity';

@Entity()
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  fieldName: string;

  @Column()
  type: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: false })
  unique: boolean;

  @ManyToOne(() => ContentType, (ct) => ct.fields)
  contentType: ContentType;
}