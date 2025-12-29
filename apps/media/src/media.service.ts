import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(Media) private repo: Repository<Media>) {}

  async saveMediaRecord(file: Express.Multer.File) {
    const media = this.repo.create({
      name: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/api/media/files/${file.filename}`
    });
    return this.repo.save(media);
  }

  async findAll() {
    return this.repo.find();
  }
}