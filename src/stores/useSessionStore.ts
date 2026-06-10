import { create } from 'zustand';
import type { Role, SessionUser } from '@/models/types/Session';

export type { Role, SessionUser } from '@/models/types/Session';

type SessionPayload = {
  user: SessionUser;
  role: Role;
  expiresAt: number;
};

type SessionState = {
  user: SessionUser | null;
  role: Role | null;
  expiresAt: number | null;
  setSession: (session: SessionPayload) => void;
  clear: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  role: null,
  expiresAt: null,
  setSession: ({ user, role, expiresAt }) => set({ user, role, expiresAt }),
  clear: () => set({ user: null, role: null, expiresAt: null }),
}));
