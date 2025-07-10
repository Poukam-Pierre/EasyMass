import { PrismaClient, Role } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcryptjs';
import { logger } from './logger';
const { createId } = require('@paralleldrive/cuid2');



const prisma = new PrismaClient();

export async function createInitialAdminAccount({
  email,
  password
}) {
  logger.info('Creating initial admin account...');
  const salt = Number(process.env.SALT_ROUNDS);
  if (isNaN(salt)) {
    logger.error('SALT_ROUNDS is not a valid number. Please check your environment variables.');
    throw new Error('Invalid SALT_ROUNDS value');
  }

  const hashPassword = hashSync(password, genSaltSync(salt));

  const payload = {
    email,
    password: hashPassword,
    role: Role.ADMIN,
    birthdate: new Date(),
    first_name: 'EasyMass',
    last_name: 'Admin',
    phone: '+237 696-841-451',
    address: 'Bangangté, Cameroon',
    is_account_verified: true,
    is_active: true,
    balance: 0,
  }

  const admin = await prisma.user.upsert({
    where: { user_id: createId() },
    update: payload,
    create: payload,
  });

  logger.info('Admin account creation completed successfully.');

  return admin;
}
