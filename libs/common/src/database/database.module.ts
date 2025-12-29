import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database.config';

@Module({})
export class DatabaseModule {
  static forRoot(entities: any[] = [], synchronize: boolean = true): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const baseConfig = getDatabaseConfig(config);
            return {
              ...baseConfig,
              entities,
              synchronize,
            };
          },
        }),
      ],
      exports: [TypeOrmModule],
    };
  }
}

