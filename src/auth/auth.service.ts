import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IJwtPayload } from './types/jwt.types';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from 'src/shared/enum/env';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private readonly refreshOptions: JwtSignOptions = {
    secret: this.configService.getOrThrow(EnvVars.JWT_REFRESH_SECRET),
    expiresIn: '30d',
  };

  async generateTokens(payload: IJwtPayload) {
    const access = await this.jwtService.signAsync(payload);
    const refresh = await this.jwtService.signAsync(
      payload,
      this.refreshOptions,
    );
    return { access, refresh };
  }

  async register(payload: RegisterDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (user) throw new BadRequestException('Username is already taken');
    payload.password = await bcrypt.hash(payload.password, 12);
    const newUser = await this.prisma.user.create({
      data: payload,
    });
    return this.generateTokens({ userId: newUser.id });
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (!user) throw new NotFoundException('User not found');
    const match = await bcrypt.compare(payload.password, user.password);
    if (!match) throw new BadRequestException('Invalid password');
    return await this.generateTokens({ userId: user.id });
  }

  async refreshToken(payload: RefreshTokenDto) {
    try {
      const jwtPayload = await this.jwtService.verifyAsync<IJwtPayload>(
        payload.token,
        this.refreshOptions,
      );
      const user = await this.validateUser(jwtPayload);
      const access = await this.jwtService.signAsync({ userId: user.id });
      return { access };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async validateUser(payload: IJwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
