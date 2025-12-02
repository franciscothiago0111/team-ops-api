import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UserListService } from './user-list.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserListController {
  constructor(private readonly userListService: UserListService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async listUsers() {
    return await this.userListService.list();
  }
}
