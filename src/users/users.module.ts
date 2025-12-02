import { Module } from '@nestjs/common';

import { UserCreateModule } from './user-create/user-create.module';
import { UserDeleteModule } from './user-delete/user-delete.module';
import { UserFindModule } from './user-find/user-find.module';
import { UserListModule } from './user-list/user-list.module';
import { UserUpdateModule } from './user-update/user-update.module';

@Module({
  imports: [
    UserDeleteModule,
    UserCreateModule,
    UserListModule,
    UserFindModule,
    UserUpdateModule,
  ],
})
export class UsersModule {}
