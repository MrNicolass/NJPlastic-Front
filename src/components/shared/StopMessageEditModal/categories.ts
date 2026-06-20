import { MACHINES } from '@/constants/ConstantsAndParams';
import type { StopMessageCategory } from '@/models/types/StopMessageCategory';
import type { Role } from '@/stores/useSessionStore';

export type { StopMessageCategory } from '@/models/types/StopMessageCategory';

/**
 * Returns the category list rendered by the variant of {@link
 * StopMessageEditModal} matching {@link userRole}. The Operator view
 * keeps five categories; Leader and Manager add a sixth
 * "Falta de operador" category.
 */
export function categoriesForRole(userRole: Role): StopMessageCategory[] {
  if (userRole === 'LEADER' || userRole === 'MANAGER' || userRole === 'ADMIN') {
    return [...MACHINES.STOPS.CATEGORIES.LEADER_MANAGER];
  }
  return [...MACHINES.STOPS.CATEGORIES.OPERATOR];
}
