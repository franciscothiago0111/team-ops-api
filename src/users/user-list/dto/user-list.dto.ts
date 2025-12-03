import { Transform } from 'class-transformer';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';

import { BaseQueryDto } from 'src/common/dto';
import { Role } from 'src/database/generated/prisma/client';

export class UserListDto extends BaseQueryDto {
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  withoutTeam?: boolean;
}
