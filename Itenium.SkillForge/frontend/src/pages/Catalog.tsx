import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { filterCourses } from './catalogUtils';
import { fetchCourses } from '@/api/client';

export function Catalog() {
  const { t } = useTranslation();
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const categories = useMemo(() => [...new Set(courses.map((c) => c.category).filter(Boolean))] as string[], [courses]);

  const levels = useMemo(() => [...new Set(courses.map((c) => c.level).filter(Boolean))] as string[], [courses]);

  const filtered = useMemo(() => filterCourses(courses, category, level), [courses, category, level]);

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('catalog.title')}</h1>
        <p className="text-muted-foreground">{t('catalog.subtitle')}</p>
      </div>

      <div className="flex gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
          aria-label={t('courses.category')}
        >
          <option value="">{t('catalog.allCategories')}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded border px-3 py-2 text-sm"
          aria-label={t('courses.level')}
        >
          <option value="">{t('catalog.allLevels')}</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t('common.noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div key={course.id} className="rounded-lg border p-5 space-y-2 hover:shadow-sm transition-shadow">
              <h2 className="font-semibold text-lg leading-tight">{course.name}</h2>
              {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}
              <div className="flex gap-2 flex-wrap">
                {course.category && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{course.category}</span>
                )}
                {course.level && <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{course.level}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
