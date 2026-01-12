import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname, parse } from 'path';
import { promises as fs } from 'fs';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  async saveMediaRecord(file: Express.Multer.File) {
    const extension = extname(file.filename || file.originalname || '');
    const hash = file.filename?.slice(0, extension ? -extension.length : undefined) || file.filename;
    const name = await this.resolveUniqueName(file.originalname);
    const media = this.repo.create({
      name,
      hash,
      ext: extension || null,
      mime: file.mimetype,
      size: file.size ? file.size / 1024 : null,
      url: `/api/media/files/${file.filename}`,
      provider: 'local',
    });
    return this.repo.save(media);
  }

  async findByFilename(filename: string) {
    const extension = extname(filename || '');
    const hash = filename.slice(0, extension ? -extension.length : undefined);
    return this.repo.findOne({ where: { hash, ext: extension || null } });
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

  private async resolveUniqueName(originalName: string) {
    if (!originalName) return 'upload';
    const parsed = parse(originalName);
    const base = parsed.name || 'upload';
    const ext = parsed.ext || '';
    let candidate = `${base}${ext}`;
    let counter = 1;

    while (await this.repo.findOne({ where: { name: candidate } })) {
      candidate = `${base}-${counter}${ext}`;
      counter += 1;
    }

    return candidate;
  }
}
