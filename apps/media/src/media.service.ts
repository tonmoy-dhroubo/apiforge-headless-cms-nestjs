import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { promises as fs } from 'fs';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  async saveMediaRecord(file: Express.Multer.File) {
    const extension = extname(file.filename || file.originalname || '');
    const hash = file.filename?.slice(0, extension ? -extension.length : undefined) || file.filename;
    const media = this.repo.create({
      name: file.originalname,
      hash,
      ext: extension || null,
      mime: file.mimetype,
      size: file.size ? file.size / 1024 : null,
      url: `/api/upload/files/${file.filename}`,
      provider: 'local',
    });
    return this.repo.save(media);
  }

  async findAll() {
    return this.repo.find();
  }

  async findById(id: number) {
    const media = await this.repo.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async delete(id: number, uploadDir: string) {
    const media = await this.findById(id);
    const fileName = `${media.hash || ''}${media.ext || ''}`;
    if (fileName.trim()) {
      await fs.unlink(`${uploadDir}/${fileName}`).catch(() => undefined);
    }
    await this.repo.remove(media);
  }
}
