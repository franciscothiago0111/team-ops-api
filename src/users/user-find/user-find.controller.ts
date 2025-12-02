import { Controller } from '@nestjs/common';
import { UserFindService } from './user-find.service';

@Controller('user-find')
export class UserFindController {
  constructor(private readonly userFindService: UserFindService) {}
}
