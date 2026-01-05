import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, Res, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';
import { MediaService } from './media.service';
import { ApiResponse } from '@app/common';

const UPLOAD_DIR = './uploads';

@Controller('api/upload')
export class MediaController {
  constructor(private service: MediaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('files', {
    storage: diskStorage({
      destination: UPLOAD_DIR,
      filename: (req, file, cb) => {
        const randomName = uuidv4();
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const media = await this.service.saveMediaRecord(file);
    return ApiResponse.success(media, 'File uploaded successfully');
  }

  @Get()
  async getAll() {
    return ApiResponse.success(await this.service.findAll());
  }

  @Get(':id')
  async getById(@Param('id') id: number) {
    return ApiResponse.success(await this.service.findById(Number(id)));
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.service.delete(Number(id), UPLOAD_DIR);
    return ApiResponse.success(null, 'File deleted successfully');
  }

  @Get('files/:filename')
  async serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const media = await this.service.findByFilename(filename);
    if (media?.name) {
      const safeName = media.name.replace(/"/g, '');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(media.name)}`,
      );
    }
    return res.sendFile(filename, { root: UPLOAD_DIR });
  }
}
