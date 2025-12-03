import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { UserFindService } from './user-find.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserFindController {
  constructor(
    private readonly userFindService: UserFindService,
    private readonly responseService: ResponseService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const foundUser = await this.userFindService.findOne(id, user);
    return this.responseService.success({
      message: 'User retrieved successfully',
      data: foundUser,
    });
  }
}
