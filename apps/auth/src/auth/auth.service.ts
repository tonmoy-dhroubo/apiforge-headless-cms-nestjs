import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private buildAuthResponse(user: User) {
    const roleNames = user.roles ? user.roles.map((r) => r.name) : [];
    const payload = { username: user.username, sub: user.id, roles: roleNames };

    return {
      token: this.jwtService.sign(payload),
      refreshToken: this.signRefreshToken(payload),
      type: 'Bearer',
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: roleNames,
    };
  }

  private signRefreshToken(payload: { username: string; sub: number; roles: string[] }) {
    const refreshSecret =
      this.configService.get('JWT_REFRESH_SECRET') ||
      this.configService.get('JWT_SECRET') ||
      'default-secret';
    const refreshExpiration =
      this.configService.get('JWT_REFRESH_EXPIRATION') || '7d';
    return this.jwtService.sign(
      { ...payload, tokenType: 'refresh' },
      { secret: refreshSecret, expiresIn: refreshExpiration },
    );
  }

  private mapUser(user: User) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      roles: user.roles ? user.roles.map((role) => role.name) : [],
      enabled: user.enabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async register(body: any) {
    try {
      const existingUser = await this.userRepo.findOne({ 
        where: { username: body.username }
      });
      if (existingUser) throw new ConflictException('Username already exists');

      const existingEmail = await this.userRepo.findOne({ 
        where: { email: body.email }
      });
      if (existingEmail) throw new ConflictException('Email already exists');

      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      let role = await this.roleRepo.findOne({ where: { name: 'REGISTERED' } });
      if (!role) {
        role = this.roleRepo.create({ name: 'REGISTERED', description: 'Default registered user' });
        role = await this.roleRepo.save(role);
      }

      const user = this.userRepo.create({
        username: body.username,
        email: body.email,
        password: hashedPassword,
        firstname: body.firstname || null,
        lastname: body.lastname || null,
        roles: [role]
      });

      const savedUser = await this.userRepo.save(user);
      const reloadedUser = await this.userRepo.findOne({
        where: { id: savedUser.id },
        relations: ['roles'],
      });
      
      return this.buildAuthResponse(reloadedUser || savedUser);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(body: any) {
    const identifier = body.username || body.email;
    if (!identifier) {
      throw new UnauthorizedException('Username or email is required');
    }

    let user = await this.userRepo.findOne({ 
      where: { username: identifier },
      relations: ['roles']
    });
    
    if (!user) {
      user = await this.userRepo.findOne({ 
        where: { email: identifier },
        relations: ['roles']
      });
    }
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.enabled) {
      throw new UnauthorizedException('Account is disabled');
    }

    return this.buildAuthResponse(user);
  }

  async getAllUsers() {
    const users = await this.userRepo.find({ relations: ['roles'] });
    return users.map((user) => this.mapUser(user));
  }

  private async getUserEntityById(id: number) {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['roles'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserById(id: number) {
    const user = await this.getUserEntityById(id);
    return this.mapUser(user);
  }

  async assignRolesToUser(id: number, roles: string[]) {
    const user = await this.getUserEntityById(id);
    const roleEntities = await this.roleRepo.find({ where: { name: In(roles) } });

    if (roleEntities.length !== roles.length) {
      const existing = new Set(roleEntities.map((r) => r.name));
      const missing = roles.filter((name) => !existing.has(name));
      throw new NotFoundException(`Role not found: ${missing.join(', ')}`);
    }

    user.roles = roleEntities;
    const saved = await this.userRepo.save(user);
    return this.mapUser(saved);
  }

  async deleteUser(id: number) {
    const user = await this.getUserEntityById(id);
    await this.userRepo.remove(user);
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    const refreshSecret =
      this.configService.get('JWT_REFRESH_SECRET') ||
      this.configService.get('JWT_SECRET') ||
      'default-secret';

    let payload: { sub?: number; tokenType?: string };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh' || !payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub },
      relations: ['roles'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.buildAuthResponse(user);
  }

  validateToken(token: string) {
    try {
      this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }
}
