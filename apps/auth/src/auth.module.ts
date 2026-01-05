import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@app/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { User, Role } from './user/user.entity';

@Module({
  imports: [
    DatabaseModule.forRoot([User, Role], false),
    TypeOrmModule.forFeature([User, Role]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') || '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
