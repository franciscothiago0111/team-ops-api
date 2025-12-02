import { Role } from 'src/database/generated/prisma/enums';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    companyId?: string;
  };
}
