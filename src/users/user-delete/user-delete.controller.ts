import { Controller } from '@nestjs/common';
import { UserDeleteService } from './user-delete.service';

@Controller('user-delete')
export class UserDeleteController {
  constructor(private readonly userDeleteService: UserDeleteService) {}
}
