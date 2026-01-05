import { Controller, Post, Body, Get, Put, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponse } from '@app/common';

@Controller('api/auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    const response = await this.service.register(body);
    return ApiResponse.success(response, 'User registered successfully');
  }

  @Post('login')
  async login(@Body() body: any) {
    const response = await this.service.login(body);
    return ApiResponse.success(response, 'Login successful');
  }

  @Post('validate')
  async validate(@Body() body: { token: string }) {
    const valid = this.service.validateToken(body.token);
    return ApiResponse.success(valid);
  }

  @Get('users')
  async getUsers() {
    return ApiResponse.success(await this.service.getAllUsers());
  }

  @Get('users/:id')
  async getUser(@Param('id') id: number) {
    return ApiResponse.success(await this.service.getUserById(Number(id)));
  }

  @Put('users/:id/roles')
  async assignRoles(@Param('id') id: number, @Body() body: { roles: string[] }) {
    const user = await this.service.assignRolesToUser(Number(id), body.roles || []);
    return ApiResponse.success(user, 'Roles assigned successfully');
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
    await this.service.deleteUser(Number(id));
    return ApiResponse.success(null, 'User deleted successfully');
  }
}
