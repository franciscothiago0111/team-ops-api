import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { Role } from 'src/database/generated/prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'User password',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    description: 'User name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: Role,
    example: Role.EMPLOYEE,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
