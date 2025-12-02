import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UserCreateService } from './user-create.service';

@Controller('users')
export class UserCreateController {
  constructor(private readonly userCreateService: UserCreateService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userCreateService.create(createUserDto);
  }
}
