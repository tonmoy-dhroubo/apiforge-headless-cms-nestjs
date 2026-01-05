import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ name: 'alternative_text', nullable: true })
  alternativeText?: string | null;

  @Column({ nullable: true })
  caption?: string | null;

  @Column({ nullable: true })
  width?: number | null;

  @Column({ nullable: true })
  height?: number | null;

  @Column()
  hash: string;

  @Column({ nullable: true })
  ext?: string | null;

  @Column({ nullable: true })
  mime?: string | null;

  @Column('numeric', { nullable: true })
  size?: number | null;

  @Column({ nullable: true })
  url?: string | null;

  @Column({ nullable: true })
  provider?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
