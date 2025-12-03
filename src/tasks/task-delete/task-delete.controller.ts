import { Controller, Delete, Param } from '@nestjs/common';
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

import { TaskDeleteService } from './task-delete.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskDeleteController {
  constructor(
    private readonly taskDeleteService: TaskDeleteService,
    private readonly responseService: ResponseService,
  ) {}

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'string' })
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const result = await this.taskDeleteService.delete(id, user);
    return this.responseService.success({
      message: 'Task deleted successfully',
      data: result,
    });
  }
}
