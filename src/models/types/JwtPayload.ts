import type { Role } from '@/models/types/Session';

export type JwtPayload = {
  sub?: string;
  exp?: number;
  iat?: number;
  iss?: string;
  role?: Role;
  sector?: string;
  shift?: string;
};
