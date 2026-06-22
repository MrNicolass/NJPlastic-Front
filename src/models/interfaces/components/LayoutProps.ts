import type { Role } from '@/models/types/Session';
import type { SessionUser } from '@/models/types/Session';

export type AppHeaderProps = {
  user: SessionUser;
  role: Role;
  mobileNavOpen?: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
};

export type AppSiderProps = {
  role: Role;
  mobileNavOpen?: boolean;
  onMobileNavOpenChange?: (open: boolean) => void;
};
