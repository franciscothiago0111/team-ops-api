import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';

import { ResponseService } from 'src/common/services';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { SignInDto } from './dto/signin.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import type { UserPayload } from './interfaces/user-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const result = await this.authService.signIn(signInDto);
    return this.responseService.success({
      message: 'User signed in successfully',
      data: result,
    });
  }

  @Get('me')
  async getMe(@CurrentUser() user: UserPayload) {
    const result = await this.authService.getMe(user.id);
    return this.responseService.success({
      message: 'User retrieved successfully',
      data: result,
    });
  }

  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@CurrentUser() user: UserPayload & { refreshTokenId: string }) {
    const result = await this.authService.refresh(user.id, user.refreshTokenId);
    return this.responseService.success({
      message: 'Tokens refreshed successfully',
      data: result,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@CurrentUser() user: UserPayload) {
    await this.authService.logout(user.id);
    return this.responseService.success({
      message: 'Logged out successfully',
      data: null,
    });
  }
}
