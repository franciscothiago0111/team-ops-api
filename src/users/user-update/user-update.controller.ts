import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';
import { Role } from 'src/database/generated/prisma/client';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserUpdateService } from './user-update.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserUpdateController {
  constructor(
    private readonly userUpdateService: UserUpdateService,
    private readonly responseService: ResponseService,
  ) {}

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userUpdateService.update(
      id,
      updateUserDto,
      user,
    );
    return this.responseService.success({
      message: 'User updated successfully',
      data: updatedUser,
    });
  }
}
