import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Team name',
    example: 'Development Team',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'IDs of the members to add to the team',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsUUID('4', { each: true })
  @IsOptional()
  memberIds?: string[];

  @IsString()
  @IsNotEmpty()
  managerId: string;
}
