import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { Media } from './media.entity';
import { AuthCommonModule } from '@app/common/auth/auth-common.module';

@Module({
  imports: [
    DatabaseModule.forRoot([Media], true),
    TypeOrmModule.forFeature([Media]),
    AuthCommonModule,
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}