import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

import { PrismaPg } from '@prisma/adapter-pg';

import {
  PrismaClient,
  Role,
  User,
} from '../src/database/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Look for an existing company or create one
  let company = await prisma.company.findFirst();

  if (!company) {
    console.log('📦 No company found, creating a new one...');
    company = await prisma.company.create({
      data: {
        name: 'Tech Solutions Inc.',
      },
    });
    console.log(`✅ Company created: ${company.name} (ID: ${company.id})`);
  } else {
    console.log(
      `✅ Found existing company: ${company.name} (ID: ${company.id})`,
    );
  }

  // Create 15 users mixing between EMPLOYEE and MANAGER
  console.log('👥 Creating 15 users...');

  const userNames = [
    'Alice Johnson',
    'Bob Smith',
    'Carol Williams',
    'David Brown',
    'Emma Davis',
    'Frank Miller',
    'Grace Wilson',
    'Henry Moore',
    'Ivy Taylor',
    'Jack Anderson',
    'Kate Thomas',
    'Liam Jackson',
    'Mia White',
    'Noah Harris',
    'Olivia Martin',
  ];

  const password = await bcrypt.hash('password123', 10);

  const usersCreated: User[] = [];

  for (let i = 0; i < 15; i++) {
    const name = userNames[i];
    const email = name.toLowerCase().replace(' ', '.') + '@techsolutions.com';
    // Alternate between EMPLOYEE and MANAGER (odd indices = MANAGER, even = EMPLOYEE)
    const role = i % 2 === 1 ? Role.MANAGER : Role.EMPLOYEE;

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
          companyId: company.id,
        },
      });

      usersCreated.push(user);
      console.log(`  ✓ Created ${role}: ${name} (${email})`);
    } catch (error: any) {
      console.log(`  ✗ Failed to create ${name}: ${error.message}`);
    }
  }

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`📊 Summary:`);
  console.log(`   - Company: ${company.name}`);
  console.log(`   - Total users created: ${usersCreated.length}`);
  console.log(
    `   - Employees: ${usersCreated.filter((u) => u.role === Role.EMPLOYEE).length}`,
  );
  console.log(
    `   - Managers: ${usersCreated.filter((u) => u.role === Role.MANAGER).length}`,
  );
  console.log(`\n🔐 Default password for all users: password123`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
