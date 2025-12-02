import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserPayload } from '../interfaces/user-payload.interface';

@Injectable()
export class IoGuard {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async checkToken(token: string) {
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return payload as UserPayload;
    } catch (e) {
      throw new UnauthorizedException(e?.message);
    }
  }
}
