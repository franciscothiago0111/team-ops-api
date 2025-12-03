import { IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiPropertyOptional({
    description: 'Team name',
    example: 'Development Team',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'ID of the company this team belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'IDs of the members in the team',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsUUID('4', { each: true })
  @IsOptional()
  memberIds?: string[];
}
