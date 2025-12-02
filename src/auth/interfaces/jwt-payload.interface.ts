import { Role } from 'src/database/generated/prisma/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  companyId?: string;
}
