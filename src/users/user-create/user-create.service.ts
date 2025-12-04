import * as bcrypt from 'bcrypt';

import { ConflictException, Injectable } from '@nestjs/common';

import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';
import {
  EventDispatcherService,
  EVENT_NAMES,
  UserCreatedEvent,
} from 'src/events';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserCreateService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: UserPayload) {
    const { email, name } = createUserDto;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: createUserDto.role,
        companyId: currentUser.companyId,
      },
    });

    // Emit USER_CREATED event
    this.eventDispatcher.dispatch(
      EVENT_NAMES.USER_CREATED,
      new UserCreatedEvent(
        user.id,
        user.email,
        user.name,
        user.role,
        user.companyId,
      ),
    );

    return user;
  }
}
