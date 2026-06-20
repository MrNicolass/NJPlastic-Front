'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import AuthService from '@/services/AuthService';
import { useSessionStore } from '@/stores/useSessionStore';

/**
 * Encapsulates the logout flow shared by the authenticated layout's header
 * (consumer) and any contextual control that ends the session.
 * Always clears the Zustand session and redirects to `/login`, even if the
 * backend logout call fails — cookies expire at exp anyway and the UX gain
 * of always reaching the login page outweighs the residual server-side
 * state, which has no revocation mechanism in the single-token model.
 */
export function useLogout() {
  const router = useRouter();
  const clearSession = useSessionStore((state) => state.clear);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await AuthService.logout(true);
    } catch (error) {
      console.warn('Logout request failed; clearing local session anyway.', error);
    } finally {
      clearSession();
      setLoggingOut(false);
      router.replace('/login');
    }
  }, [clearSession, router]);

  return { logout, loggingOut };
}
