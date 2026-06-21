import { useSessionStore, type Role, type SessionUser } from '@/stores/useSessionStore';

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ user: null, role: null, expiresAt: null });
  });

  it('starts with null user, role and expiresAt', () => {
    const state = useSessionStore.getState();

    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.expiresAt).toBeNull();
  });

  it('exposes setSession and clear as functions', () => {
    const state = useSessionStore.getState();

    expect(typeof state.setSession).toBe('function');
    expect(typeof state.clear).toBe('function');
  });

  it('setSession stores the user, role and expiresAt fields', () => {
    const user: SessionUser = { id: 'u1', name: 'Alice', login: 'alice' };
    const role: Role = 'MANAGER';
    const expiresAt = 1_700_000_000_000;

    useSessionStore.getState().setSession({ user, role, expiresAt });

    const state = useSessionStore.getState();
    expect(state.user).toEqual(user);
    expect(state.role).toBe(role);
    expect(state.expiresAt).toBe(expiresAt);
  });

  it('clear resets user, role and expiresAt back to null', () => {
    useSessionStore.getState().setSession({
      user: { id: 'u1', name: 'Bob', login: 'bob' },
      role: 'OPERATOR',
      expiresAt: 1_700_000_000_000,
    });

    useSessionStore.getState().clear();

    const state = useSessionStore.getState();
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.expiresAt).toBeNull();
  });

  it.each<Role>(['OPERATOR', 'LEADER', 'MANAGER'])(
    'accepts the %s role on setSession',
    (role) => {
      useSessionStore.getState().setSession({
        user: { id: 'u', name: 'n', login: 'l' },
        role,
        expiresAt: 1,
      });

      expect(useSessionStore.getState().role).toBe(role);
    },
  );

  it('notifies subscribers when setSession is called', () => {
    const subscriber = jest.fn();
    const unsubscribe = useSessionStore.subscribe(subscriber);

    useSessionStore.getState().setSession({
      user: { id: 'u1', name: 'Alice', login: 'alice' },
      role: 'LEADER',
      expiresAt: 42,
    });

    expect(subscriber).toHaveBeenCalled();
    unsubscribe();
  });

  it('notifies subscribers when clear is called', () => {
    useSessionStore.getState().setSession({
      user: { id: 'u1', name: 'Alice', login: 'alice' },
      role: 'LEADER',
      expiresAt: 42,
    });

    const subscriber = jest.fn();
    const unsubscribe = useSessionStore.subscribe(subscriber);

    useSessionStore.getState().clear();

    expect(subscriber).toHaveBeenCalled();
    unsubscribe();
  });
});
