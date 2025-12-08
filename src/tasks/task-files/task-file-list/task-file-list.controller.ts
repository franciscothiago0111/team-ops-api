import { Controller } from '@nestjs/common';
import { TaskFileListService } from './task-file-list.service';

@Controller('task-file-list')
export class TaskFileListController {
  constructor(private readonly taskFileListService: TaskFileListService) {}
}
