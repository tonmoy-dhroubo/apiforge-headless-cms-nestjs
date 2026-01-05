import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { ContentTypeController } from './content-type.controller';
import { ContentTypeService } from './services/content-type.service';
import { DynamicTableService } from './services/dynamic-table.service';
import { ContentType } from './entities/content-type.entity';
import { Field } from './entities/field.entity';
import { AuthCommonModule } from '@app/common/auth/auth-common.module';

@Module({
  imports: [
    DatabaseModule.forRoot([ContentType, Field], false),
    TypeOrmModule.forFeature([ContentType, Field]),
    AuthCommonModule,
  ],
  controllers: [ContentTypeController],
  providers: [ContentTypeService, DynamicTableService],
})
export class ContentTypeModule {}
