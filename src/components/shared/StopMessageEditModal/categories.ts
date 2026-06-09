import { MACHINES } from '@/constants/ConstantsAndParams';
import type { Role } from '@/stores/useSessionStore';

export type StopMessageCategory = {
  value: string;
  label: string;
};

/**
 * Returns the category list rendered by the variant of {@link
 * StopMessageEditModal} matching {@link userRole}. The Operator view
 * (RN02) keeps five categories; Leader (RN03) and Manager (RN04) add
 * "Falta de operador" per RFC §4.2.10.
 */
export function categoriesForRole(userRole: Role): StopMessageCategory[] {
  if (userRole === 'LEADER' || userRole === 'MANAGER' || userRole === 'ADMIN') {
    return [...MACHINES.STOPS.CATEGORIES.LEADER_MANAGER];
  }
  return [...MACHINES.STOPS.CATEGORIES.OPERATOR];
}
