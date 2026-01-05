import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ContentType } from './content-type.entity';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'field_name' })
  fieldName: string;

  @Column()
  type: string;

  @Column({ default: false })
  required: boolean;

  @Column({ default: false })
  unique: boolean;

  @Column({ name: 'target_content_type', nullable: true })
  targetContentType?: string | null;

  @Column({ name: 'relation_type', nullable: true })
  relationType?: string | null;

  @ManyToOne(() => ContentType, (ct) => ct.fields)
  @JoinColumn({ name: 'content_type_id' })
  contentType: ContentType;
}
