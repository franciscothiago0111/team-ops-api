import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';

import { ResponseService } from 'src/common/services';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { SignInDto } from './dto/signin.dto';
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
}
