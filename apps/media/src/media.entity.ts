import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Media {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  filename: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  size: number;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt: Date;
}