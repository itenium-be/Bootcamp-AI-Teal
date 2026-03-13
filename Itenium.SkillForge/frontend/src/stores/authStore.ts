import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  role?: string | string[];
  exp?: number;
}

type UserRole = 'backoffice' | 'manager' | 'learner';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBackOffice: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

function parseRole(decoded: JwtPayload): UserRole {
  const roles = Array.isArray(decoded.role) ? decoded.role : decoded.role ? [decoded.role] : [];
  if (roles.includes('backoffice')) return 'backoffice';
  if (roles.includes('manager')) return 'manager';
  return 'learner';
}

function parseUserFromToken(token: string): User {
  const decoded = jwtDecode<JwtPayload>(token);
  const role = parseRole(decoded);
  return {
    id: decoded.sub,
    email: decoded.email || decoded.preferred_username || '',
    name: decoded.name || decoded.preferred_username || 'User',
    role,
    isBackOffice: role === 'backoffice',
  };
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        const user = parseUserFromToken(token);
        set({
          accessToken: token,
          user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
        // Clear team store on logout
        localStorage.removeItem('team-storage');
      },
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Check if token is expired on rehydration
        if (state?.accessToken && isTokenExpired(state.accessToken)) {
          state.logout();
        }
      },
    },
  ),
);
