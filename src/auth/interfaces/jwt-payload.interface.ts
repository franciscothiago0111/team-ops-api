import { Role } from 'src/database/generated/prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  companyId?: string;
}
