import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Priority, TaskStatus } from 'src/database/generated/prisma/client';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Write comprehensive documentation for the API',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: Priority,
    example: Priority.MEDIUM,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Task due date',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Task labels/tags',
    example: ['bug', 'frontend', 'urgent'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this task',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiProperty({
    description: 'ID of the team this task belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;
}
