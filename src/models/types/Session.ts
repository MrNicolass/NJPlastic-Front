export type Role = 'OPERATOR' | 'LEADER' | 'MANAGER' | 'ADMIN';

export type SessionUser = {
  id: string;
  name: string;
  login: string;
};
