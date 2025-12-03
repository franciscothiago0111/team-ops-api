import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { UserListDto } from './dto/user-list.dto';
import { UserListService } from './user-list.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserListController {
  constructor(
    private readonly userListService: UserListService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async listUsers(
    @CurrentUser() user: UserPayload,
    @Query() query: UserListDto,
  ) {
    const users = await this.userListService.list(user, query);
    return this.responseService.success({
      message: 'Users retrieved successfully',
      data: users,
    });
  }
}
