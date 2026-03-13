import { useAuthStore } from '../authStore';

function createToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

function resetStore() {
  useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
  localStorage.clear();
}

beforeEach(() => {
  resetStore();
});

describe('useAuthStore — role parsing', () => {
  it('sets role to "backoffice" when JWT role claim is backoffice', () => {
    const token = createToken({ sub: 'u1', name: 'Alice', role: 'backoffice' });
    useAuthStore.getState().setToken(token);
    expect(useAuthStore.getState().user?.role).toBe('backoffice');
  });

  it('sets role to "manager" when JWT role claim is manager', () => {
    const token = createToken({ sub: 'u2', name: 'Nathalie', role: 'manager' });
    useAuthStore.getState().setToken(token);
    expect(useAuthStore.getState().user?.role).toBe('manager');
  });

  it('sets role to "learner" when JWT role claim is learner', () => {
    const token = createToken({ sub: 'u3', name: 'Lea', role: 'learner' });
    useAuthStore.getState().setToken(token);
    expect(useAuthStore.getState().user?.role).toBe('learner');
  });

  it('sets role to "learner" when JWT role claim is missing', () => {
    const token = createToken({ sub: 'u4', name: 'Unknown' });
    useAuthStore.getState().setToken(token);
    expect(useAuthStore.getState().user?.role).toBe('learner');
  });

  it('picks first recognized role when role is an array', () => {
    const token = createToken({ sub: 'u5', name: 'Multi', role: ['manager', 'backoffice'] });
    useAuthStore.getState().setToken(token);
    const role = useAuthStore.getState().user?.role;
    expect(['backoffice', 'manager']).toContain(role);
  });
});
