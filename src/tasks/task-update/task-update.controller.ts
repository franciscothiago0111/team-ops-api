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

import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskUpdateService } from './task-update.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskUpdateController {
  constructor(
    private readonly taskUpdateService: TaskUpdateService,
    private readonly responseService: ResponseService,
  ) {}

  @Put(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'string' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    const task = await this.taskUpdateService.update(id, updateTaskDto, user);
    return this.responseService.success({
      message: 'Task updated successfully',
      data: task,
    });
  }
}
