import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { TaskListDto } from './dto/task-list.dto';
import { TaskListService } from './task-list.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskListController {
  constructor(
    private readonly taskListService: TaskListService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the current user' })
  async getMyTasks(
    @CurrentUser() user: UserPayload,
    @Query() query: TaskListDto,
  ) {
    const result = await this.taskListService.getTasksForUser(user.id, query);
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Tasks retrieved successfully',
    });
  }
}
