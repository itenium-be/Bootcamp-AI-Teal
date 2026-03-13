import type { UserSummary } from '@/api/client';

export function sortUsers(users: UserSummary[]): UserSummary[] {
  return [...users].sort((a, b) => {
    if (a.name === null && b.name === null) return 0;
    if (a.name === null) return 1;
    if (b.name === null) return -1;
    return a.name.localeCompare(b.name);
  });
}
