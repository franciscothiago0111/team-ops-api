import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../database/prisma.service';
import { SignInDto } from './dto/signin.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** SHA-256 of a token — deterministic, so we can look up by hash with @unique */
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: signInDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(user);
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Called by JwtRefreshStrategy.
   * Returns user data + the DB record id so the controller can rotate the token.
   */
  async validateRefreshToken(userId: string, rawToken: string) {
    const tokenHash = hashToken(rawToken);

    const record = await this.prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            companyId: true,
          },
        },
      },
    });

    if (!record || record.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Reuse detection: token was already revoked — possible theft; wipe all sessions
    if (record.revoked) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
      throw new ForbiddenException('Access denied');
    }

    if (record.expiresAt < new Date()) {
      throw new ForbiddenException('Refresh token expired');
    }

    return {
      id: record.user.id,
      email: record.user.email,
      name: record.user.name,
      role: record.user.role,
      companyId: record.user.companyId,
      refreshTokenId: record.id,
    };
  }

  /** Rotate: revoke consumed token and issue a fresh pair */
  async refresh(userId: string, refreshTokenId: string): Promise<AuthResponse> {
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: { revoked: true },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateAuthResponse(user);
  }

  /** Revoke all active sessions for this user */
  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateAuthResponse(user: any): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload as any, {
        secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
        expiresIn: refreshExpiresIn as any,
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // mirrors JWT_REFRESH_EXPIRES_IN default (7d)

    await this.prisma.refreshToken.create({
      data: {
        token: hashToken(refresh_token),
        userId: user.id,
        expiresAt,
      },
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }
}
