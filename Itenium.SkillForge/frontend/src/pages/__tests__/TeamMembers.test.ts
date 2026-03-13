import { describe, it, expect } from 'vitest';
import { sortUsers } from '../teamMembersUtils';
import type { UserSummary } from '@/api/client';

const makeUser = (name: string | null, id = name ?? 'x'): UserSummary => ({
  id,
  name,
  email: `${id}@test.com`,
  profileId: null,
});

describe('sortUsers', () => {
  it('sorts users alphabetically by name', () => {
    const users = [makeUser('Charlie'), makeUser('Alice'), makeUser('Bob')];
    const sorted = sortUsers(users);
    expect(sorted.map((u) => u.name)).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('returns empty array for empty input', () => {
    expect(sortUsers([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const users = [makeUser('Bob'), makeUser('Alice')];
    const original = [...users];
    sortUsers(users);
    expect(users).toEqual(original);
  });

  it('places null names at the end', () => {
    const users = [makeUser(null, 'z'), makeUser('Alice'), makeUser(null, 'y')];
    const sorted = sortUsers(users);
    expect(sorted[0].name).toBe('Alice');
  });

  it('handles a single user', () => {
    const users = [makeUser('Solo')];
    expect(sortUsers(users)).toHaveLength(1);
  });
});
