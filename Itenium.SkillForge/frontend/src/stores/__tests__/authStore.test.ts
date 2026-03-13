import { useAuthStore } from '../authStore';

/** Create a JWT with the given payload (signature is not verified by jwt-decode) */
function createToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

function resetStore() {
  useAuthStore.setState({
    accessToken: null,
    user: null,
    isAuthenticated: false,
  });
  localStorage.clear();
}

beforeEach(() => {
  resetStore();
});

describe('useAuthStore', () => {
  describe('setToken', () => {
    it('sets user from a token with all fields', () => {
      const token = createToken({
        sub: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'backoffice',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      useAuthStore.getState().setToken(token);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.accessToken).toBe(token);
      expect(state.user).toEqual({
        id: 'user-123',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'backoffice',
        isBackOffice: true,
      });
    });

    it('handles role as an array', () => {
      const token = createToken({
        sub: 'user-456',
        name: 'Bob',
        email: 'bob@example.com',
        role: ['manager', 'backoffice'],
      });

      useAuthStore.getState().setToken(token);

      expect(useAuthStore.getState().user?.isBackOffice).toBe(true);
    });

    it('sets isBackOffice to false when role does not include backoffice', () => {
      const token = createToken({
        sub: 'user-789',
        name: 'Charlie',
        email: 'charlie@example.com',
        role: 'manager',
      });

      useAuthStore.getState().setToken(token);

      expect(useAuthStore.getState().user?.isBackOffice).toBe(false);
    });

    it('sets isBackOffice to false when role is missing', () => {
      const token = createToken({
        sub: 'user-000',
        name: 'Dave',
        email: 'dave@example.com',
      });

      useAuthStore.getState().setToken(token);

      expect(useAuthStore.getState().user?.isBackOffice).toBe(false);
    });

    it('falls back to preferred_username for email and name', () => {
      const token = createToken({
        sub: 'user-111',
        preferred_username: 'jane.doe',
      });

      useAuthStore.getState().setToken(token);

      const user = useAuthStore.getState().user;
      expect(user?.email).toBe('jane.doe');
      expect(user?.name).toBe('jane.doe');
    });

    it('falls back to defaults when no name or username', () => {
      const token = createToken({
        sub: 'user-222',
      });

      useAuthStore.getState().setToken(token);

      const user = useAuthStore.getState().user;
      expect(user?.email).toBe('');
      expect(user?.name).toBe('User');
    });
  });

  describe('logout', () => {
    it('clears auth state', () => {
      const token = createToken({ sub: 'user-1', name: 'Test', email: 'test@test.com' });
      useAuthStore.getState().setToken(token);

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
      expect(state.user).toBeNull();
    });

    it('removes team-storage from localStorage', () => {
      localStorage.setItem('team-storage', JSON.stringify({ mode: 'manager' }));

      useAuthStore.getState().logout();

      expect(localStorage.getItem('team-storage')).toBeNull();
    });
  });
});
