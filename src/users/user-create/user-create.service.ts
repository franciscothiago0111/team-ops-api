import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserCreateService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, name } = createUserDto;

    return await this.prismaService.user.create({
      data: {
        email,
        name,
      },
    });
  }
}
