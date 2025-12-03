import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';

import { Priority, TaskStatus } from 'src/database/generated/prisma/client';

export class MetricsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  taskStatus?: TaskStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  companyId?: string;
}
