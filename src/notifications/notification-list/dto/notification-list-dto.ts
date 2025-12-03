import { IsBoolean, IsOptional } from 'class-validator';

import { BaseQueryDto } from 'src/common/dto';

export class NotificationListDto extends BaseQueryDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
