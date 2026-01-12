import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '@app/common';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { User, Role } from './user/user.entity';
import { GoogleStrategy } from './auth/google.strategy';
import { GoogleAuthGuard } from './auth/google.guard';

@Module({
  imports: [
    DatabaseModule.forRoot([User, Role], false),
    TypeOrmModule.forFeature([User, Role]),
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET') || 'default-secret',
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') || '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GoogleAuthGuard],
})
export class AuthModule {}
