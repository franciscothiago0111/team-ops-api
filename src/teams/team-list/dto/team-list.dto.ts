import { IsOptional, IsUUID } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseQueryDto } from 'src/common/dto';

export class TeamListDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filter teams by company ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
