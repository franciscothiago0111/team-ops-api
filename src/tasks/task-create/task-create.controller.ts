import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskCreateService } from './task-create.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskCreateController {
  constructor(
    private readonly taskCreateService: TaskCreateService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.taskCreateService.create(createTaskDto, user);
    return this.responseService.success({
      message: 'Task created successfully',
      data: task,
    });
  }
}
