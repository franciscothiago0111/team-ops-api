import { Controller, Delete, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';
import { Role } from 'src/database/generated/prisma/client';

import { UserDeleteService } from './user-delete.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserDeleteController {
  constructor(
    private readonly userDeleteService: UserDeleteService,
    private readonly responseService: ResponseService,
  ) {}

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires ADMIN or MANAGER role',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.userDeleteService.delete(id, user);
    return this.responseService.success({
      message: 'User deleted successfully',
      data: result,
    });
  }
}
