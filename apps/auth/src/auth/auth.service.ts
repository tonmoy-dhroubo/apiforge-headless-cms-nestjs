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
    const exists = await this.userRepo.findOne({ where: { username: body.username } });
    if (exists) throw new ConflictException('User exists');

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    let role = await this.roleRepo.findOne({ where: { name: 'REGISTERED' } });
    if (!role) {
      role = await this.roleRepo.save({ name: 'REGISTERED' });
    }

    const user = this.userRepo.create({
      ...body,
      password: hashedPassword,
      roles: [role]
    });

    await this.userRepo.save(user);
    return this.login(body);
  }

  async login(body: any) {
    const user = await this.userRepo.findOne({ where: { username: body.username } });
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id, roles: user.roles.map(r => r.name) };
    return {
      success: true,
      data: {
        token: this.jwtService.sign(payload),
        user: { id: user.id, username: user.username, roles: payload.roles }
      }
    };
  }

  async getAllUsers() {
    return this.userRepo.find();
  }
}