import * as bcrypt from 'bcrypt';

import { ConflictException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';

import { CreateCompanyDto } from './dto/company-create.dto';

@Injectable()
export class CompanyCreateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    //crete a admin user first
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createCompanyDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    //check if company name already exists
    const existingCompany = await this.prisma.company.findFirst({
      where: { name: createCompanyDto.companyName },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already in use');
    }

    console.log('Creating company and admin user...');

    // Hash password
    const hashedPassword = await bcrypt.hash(createCompanyDto.password, 10);

    //create the company and admin user in a transaction
    const company = await this.prisma.$transaction(async (tx) => {
      // First create the company without admin
      const newCompany = await tx.company.create({
        data: {
          name: createCompanyDto.companyName,
        },
      });

      // Then create the admin user
      const adminUser = await tx.user.create({
        data: {
          email: createCompanyDto.email,
          name: createCompanyDto.name,
          role: 'ADMIN',
          password: hashedPassword,
          companyId: newCompany.id,
        },
      });

      // Finally update the company with the admin ID
      const updatedCompany = await tx.company.update({
        where: { id: newCompany.id },
        data: { adminId: adminUser.id },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      return updatedCompany;
    });

    return company;
  }
}
