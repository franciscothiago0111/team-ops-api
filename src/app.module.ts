import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { CompaniesModule } from './companies/companies.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { WebsocketModule } from './websocket/websocket.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    DatabaseModule,
    AuthModule,
    CommonModule,
    CompaniesModule,
    WebsocketModule,
  ],
})
export class AppModule {}
