
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  //admin user
  const adminPassword = await bcrypt.hash('password-admin', 10);
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // regular user
  const userPassword = await bcrypt.hash('password-user', 10);
  const user = await prisma.user.create({
    data: {
      firstName: 'Regular',
      lastName: 'User',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
      emailVerified: true,
    },
  });

  console.log({ admin, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
