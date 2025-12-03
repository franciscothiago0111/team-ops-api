import { IsEnum, IsOptional } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseQueryDto } from 'src/common/dto';
import { TaskStatus } from 'src/database/generated/prisma/client';

export class TaskListDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filter tasks by status',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
