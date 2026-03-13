import type { Course } from '@/api/client';

export function filterCourses(courses: Course[], category: string, level: string): Course[] {
  return courses.filter((c) => {
    if (category && c.category !== category) return false;
    if (level && c.level !== level) return false;
    return true;
  });
}
