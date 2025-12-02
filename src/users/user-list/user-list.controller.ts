import { Controller, Get } from '@nestjs/common';

import { UserListService } from './user-list.service';

@Controller('users')
export class UserListController {
  constructor(private readonly userListService: UserListService) {}

  @Get()
  async listUsers() {
    return await this.userListService.list();
  }
}
