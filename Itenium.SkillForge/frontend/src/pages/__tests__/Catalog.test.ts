import { filterCourses } from '../catalogUtils';
import type { Course } from '@/api/client';

const courses: Course[] = [
  { id: 1, name: 'React Basics', description: null, category: 'Frontend', level: 'Beginner' },
  { id: 2, name: 'Advanced TypeScript', description: null, category: 'Frontend', level: 'Advanced' },
  { id: 3, name: 'Docker 101', description: null, category: 'DevOps', level: 'Beginner' },
  { id: 4, name: 'Node.js API', description: null, category: 'Backend', level: 'Intermediate' },
];

describe('filterCourses', () => {
  it('returns all courses when no filters applied', () => {
    expect(filterCourses(courses, '', '')).toHaveLength(4);
  });

  it('filters by category', () => {
    const result = filterCourses(courses, 'Frontend', '');
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.name)).toEqual(['React Basics', 'Advanced TypeScript']);
  });

  it('filters by level', () => {
    const result = filterCourses(courses, '', 'Beginner');
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.name)).toEqual(['React Basics', 'Docker 101']);
  });

  it('filters by both category and level', () => {
    const result = filterCourses(courses, 'Frontend', 'Advanced');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Advanced TypeScript');
  });

  it('returns empty array when no matches', () => {
    expect(filterCourses(courses, 'Frontend', 'Intermediate')).toHaveLength(0);
  });

  it('ignores courses with null category when filtering by category', () => {
    const withNull: Course[] = [...courses, { id: 5, name: 'Misc', description: null, category: null, level: null }];
    const result = filterCourses(withNull, 'Frontend', '');
    expect(result.map((c) => c.id)).not.toContain(5);
  });
});
