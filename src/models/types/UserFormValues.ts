import type { Schemas } from '@/api/types';

export type UserFormValues = {
  login?: string;
  name: string;
  email: string;
  password?: string;
  role: Schemas['UserResponseDTO']['role'];
  sector?: string;
  shift?: string;
  active?: boolean;
};
