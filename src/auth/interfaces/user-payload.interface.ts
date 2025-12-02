import { User } from 'src/database/generated/prisma/client';

export interface UserPayload extends Omit<User, 'password'> {
  companyId: string;
  sub: string;
}
