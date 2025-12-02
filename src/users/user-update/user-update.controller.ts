import { Controller } from '@nestjs/common';
import { UserUpdateService } from './user-update.service';

@Controller('user-update')
export class UserUpdateController {
  constructor(private readonly userUpdateService: UserUpdateService) {}
}
