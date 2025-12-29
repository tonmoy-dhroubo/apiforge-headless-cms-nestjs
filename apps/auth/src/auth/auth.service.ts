import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    private jwtService: JwtService,
  ) {}

  async register(body: any) {
    try {
      // Check if user exists by username or email
      const existingUser = await this.userRepo.findOne({ 
        where: { username: body.username }
      });
      if (existingUser) throw new ConflictException('Username already exists');

      const existingEmail = await this.userRepo.findOne({ 
        where: { email: body.email }
      });
      if (existingEmail) throw new ConflictException('Email already exists');

      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      // Get or create REGISTERED role
      let role = await this.roleRepo.findOne({ where: { name: 'REGISTERED' } });
      if (!role) {
        role = this.roleRepo.create({ name: 'REGISTERED' });
        role = await this.roleRepo.save(role);
      }

      // Create user
      const user = this.userRepo.create({
        username: body.username,
        email: body.email,
        password: hashedPassword,
        firstname: body.firstname || null,
        lastname: body.lastname || null,
        roles: [role]
      });

      const savedUser = await this.userRepo.save(user);
      
      // Return login response (roles are eager loaded, so they should be available)
      const roleNames = savedUser.roles ? savedUser.roles.map(r => r.name) : [];
      const payload = { 
        username: savedUser.username, 
        sub: savedUser.id, 
        roles: roleNames
      };
      return {
        success: true,
        data: {
          token: this.jwtService.sign(payload),
          user: { 
            id: userWithRoles.id, 
            username: userWithRoles.username, 
            email: userWithRoles.email, 
            roles: payload.roles 
          }
        }
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async login(body: any) {
    // Support both username and email login
    const identifier = body.username || body.email;
    if (!identifier) {
      throw new UnauthorizedException('Username or email is required');
    }

    // Try username first, then email
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

    const payload = { username: user.username, sub: user.id, roles: user.roles.map(r => r.name) };
    return {
      success: true,
      data: {
        token: this.jwtService.sign(payload),
        user: { id: user.id, username: user.username, email: user.email, roles: payload.roles }
      }
    };
  }

  async getAllUsers() {
    return this.userRepo.find({ relations: ['roles'] });
  }
}