import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { ContentController } from './content.controller';
import { DynamicContentService } from './dynamic-content.service';
import { AuthCommonModule } from '@app/common/auth/auth-common.module';

@Module({
  imports: [
    DatabaseModule.forRoot([], false),
    AuthCommonModule,
  ],
  controllers: [ContentController],
  providers: [DynamicContentService],
})
export class ContentModule {}