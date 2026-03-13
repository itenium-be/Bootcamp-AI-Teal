import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@itenium-forge/ui';
import type { Course } from '@/api/client';

const courseSchema = z.object({
  name: z.string().min(1, { message: 'courses.nameRequired' }),
  description: z.string(),
  category: z.string(),
  level: z.string(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CourseFormValues) => void;
  isPending?: boolean;
}

export function CourseForm({ course, open, onOpenChange, onSave, isPending }: CourseFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: course?.name ?? '',
      description: course?.description ?? '',
      category: course?.category ?? '',
      level: course?.level ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: course?.name ?? '',
      description: course?.description ?? '',
      category: course?.category ?? '',
      level: course?.level ?? '',
    });
  }, [course, reset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{course ? t('courses.editCourse') : t('courses.addCourse')}</SheetTitle>
          <SheetDescription>{t('courses.formDescription')}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 py-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              {t('courses.name')}
            </label>
            <input id="name" {...register('name')} className="w-full rounded border px-3 py-2 text-sm" />
            {errors.name && <p className="text-sm text-destructive">{t(errors.name.message ?? '')}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              {t('courses.description')}
            </label>
            <input id="description" {...register('description')} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor="category" className="text-sm font-medium">
              {t('courses.category')}
            </label>
            <input id="category" {...register('category')} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor="level" className="text-sm font-medium">
              {t('courses.level')}
            </label>
            <input id="level" {...register('level')} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t('common.save')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
