import { UserRole } from '@/models/enums/UserRole';

export type Role = `${UserRole}`;

export type SessionUser = {
  id: string;
  name: string;
  login: string;
};
