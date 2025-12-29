import { Controller, Post, Get, Param, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { Response } from 'express';
import { MediaService } from './media.service';
import { ApiResponse } from '@app/common';

@Controller('api/media')
export class MediaController {
  constructor(private service: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = uuidv4();
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const media = await this.service.saveMediaRecord(file);
    return ApiResponse.success(media, 'Uploaded');
  }

  @Get()
  async getAll() {
    return ApiResponse.success(await this.service.findAll());
  }

  @Get('files/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: './uploads' });
  }
}