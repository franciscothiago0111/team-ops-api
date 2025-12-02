import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';
import { Role } from 'src/database/generated/prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { UserCreateService } from './user-create.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserCreateController {
  constructor(
    private readonly userCreateService: UserCreateService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new user' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: UserPayload,
  ) {
    const newUser = await this.userCreateService.create(createUserDto, user);

    return this.responseService.success({
      message: 'User created successfully',
      data: newUser,
    });
  }
}
