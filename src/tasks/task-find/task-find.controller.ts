import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { TaskFindService } from './task-find.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskFindController {
  constructor(
    private readonly taskFindService: TaskFindService,
    private readonly responseService: ResponseService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', type: 'string' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    const task = await this.taskFindService.findOne(id, user);
    return this.responseService.success({
      message: 'Task retrieved successfully',
      data: task,
    });
  }
}
