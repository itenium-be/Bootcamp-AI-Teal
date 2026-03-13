import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@itenium-forge/ui';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { CourseFormValues } from './CourseForm';
import { CourseForm } from './CourseForm';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '@/api/client';
import type { Course } from '@/api/client';
import { useAuthStore } from '@/stores';

export function Courses() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const canManage = user?.isBackOffice ?? false;

  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  function toPayload(data: CourseFormValues) {
    return {
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      level: data.level || null,
    };
  }

  const createMutation = useMutation({
    mutationFn: (data: CourseFormValues) => createCourse(toPayload(data)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
      setFormOpen(false);
      toast.success(t('courses.saveSuccess'));
    },
    onError: () => toast.error(t('courses.saveFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CourseFormValues) => updateCourse(editCourse?.id ?? 0, toPayload(data)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
      setFormOpen(false);
      setEditCourse(undefined);
      toast.success(t('courses.saveSuccess'));
    },
    onError: () => toast.error(t('courses.saveFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCourse(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDeleteTarget(null);
      toast.success(t('courses.deleteSuccess'));
    },
    onError: () => toast.error(t('courses.deleteFailed')),
  });

  function handleOpenAdd() {
    setEditCourse(undefined);
    setFormOpen(true);
  }

  function handleOpenEdit(course: Course) {
    setEditCourse(course);
    setFormOpen(true);
  }

  function handleSave(data: CourseFormValues) {
    if (editCourse) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('courses.title')}</h1>
        {canManage && (
          <Button onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('courses.addCourse')}
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">{t('courses.name')}</th>
              <th className="p-3 text-left font-medium">{t('courses.description')}</th>
              <th className="p-3 text-left font-medium">{t('courses.category')}</th>
              <th className="p-3 text-left font-medium">{t('courses.level')}</th>
              {canManage && <th className="p-3 text-left font-medium">{t('courses.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {courses?.map((course) => (
              <tr key={course.id} className="border-b">
                <td className="p-3">{course.name}</td>
                <td className="p-3 text-muted-foreground">{course.description || '-'}</td>
                <td className="p-3">{course.category || '-'}</td>
                <td className="p-3">{course.level || '-'}</td>
                {canManage && (
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(course)}
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(course)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {courses?.length === 0 && (
              <tr>
                <td colSpan={canManage ? 5 : 4} className="p-3 text-center text-muted-foreground">
                  {t('courses.noCourses')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CourseForm
        key={editCourse?.id ?? 'new'}
        course={editCourse}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditCourse(undefined);
        }}
        onSave={handleSave}
        isPending={isPending}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{t('courses.deleteCourse')}</h3>
            <p className="text-muted-foreground">{t('courses.confirmDelete', { name: deleteTarget.name })}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
