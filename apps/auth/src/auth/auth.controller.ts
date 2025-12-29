import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@app/common';

@Controller('api/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.service.register(body);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.service.login(body);
  }

  @Get('users')
  async getUsers() {
    return ApiResponse.success(await this.service.getAllUsers());
  }
}