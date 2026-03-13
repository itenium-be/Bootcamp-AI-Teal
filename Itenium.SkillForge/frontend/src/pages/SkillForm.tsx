import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@itenium-forge/ui';
import type { Skill, SkillProfile } from '@/api/client';

const skillSchema = z.object({
  name: z.string().min(1, { message: 'skills.nameRequired' }),
  category: z.string(),
  description: z.string(),
  levelCount: z.number().min(1).max(5),
  isUniversal: z.boolean(),
  profileId: z.string(),
  prerequisiteIds: z.array(z.number()),
});

export type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillFormProps {
  skill?: Skill;
  profiles: SkillProfile[];
  skills: Skill[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: SkillFormValues) => void;
  isPending?: boolean;
}

export function SkillForm({ skill, profiles, skills, open, onOpenChange, onSave, isPending }: SkillFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: skill?.name ?? '',
      category: skill?.category ?? '',
      description: skill?.description ?? '',
      levelCount: skill?.levelCount ?? 3,
      isUniversal: skill?.isUniversal ?? false,
      profileId: skill?.profileId?.toString() ?? '',
      prerequisiteIds: [],
    },
  });

  useEffect(() => {
    reset({
      name: skill?.name ?? '',
      category: skill?.category ?? '',
      description: skill?.description ?? '',
      levelCount: skill?.levelCount ?? 3,
      isUniversal: skill?.isUniversal ?? false,
      profileId: skill?.profileId?.toString() ?? '',
      prerequisiteIds: [],
    });
  }, [skill, reset]);

  const isUniversal = watch('isUniversal');
  const prerequisiteIds = watch('prerequisiteIds');

  function togglePrerequisite(id: number) {
    const current = prerequisiteIds ?? [];
    if (current.includes(id)) {
      setValue(
        'prerequisiteIds',
        current.filter((p) => p !== id),
      );
    } else {
      setValue('prerequisiteIds', [...current, id]);
    }
  }

  const availablePrerequisites = skills.filter((s) => s.id !== skill?.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{skill ? t('skills.editSkill') : t('skills.addSkill')}</SheetTitle>
          <SheetDescription>{t('skills.formDescription')}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 py-4">
          <div className="space-y-1">
            <label htmlFor="skill-name" className="text-sm font-medium">
              {t('skills.name')}
            </label>
            <input
              id="skill-name"
              aria-label={t('skills.name')}
              {...register('name')}
              className="w-full rounded border px-3 py-2 text-sm"
            />
            {errors.name && <p className="text-sm text-destructive">{t(errors.name.message ?? '')}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="skill-category" className="text-sm font-medium">
              {t('skills.category')}
            </label>
            <input id="skill-category" {...register('category')} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label htmlFor="skill-description" className="text-sm font-medium">
              {t('skills.description')}
            </label>
            <textarea
              id="skill-description"
              {...register('description')}
              className="w-full rounded border px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="skill-levelCount" className="text-sm font-medium">
              {t('skills.levelCount')}
            </label>
            <input
              id="skill-levelCount"
              aria-label={t('skills.levelCount')}
              type="number"
              min={1}
              max={5}
              {...register('levelCount', { valueAsNumber: true })}
              className="w-full rounded border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input id="skill-isUniversal" type="checkbox" {...register('isUniversal')} className="h-4 w-4" />
            <label htmlFor="skill-isUniversal" className="text-sm font-medium">
              {t('skills.isUniversal')}
            </label>
          </div>
          {!isUniversal && (
            <div className="space-y-1">
              <label htmlFor="skill-profileId" className="text-sm font-medium">
                {t('skills.profile')}
              </label>
              <select
                id="skill-profileId"
                {...register('profileId')}
                className="w-full rounded border px-3 py-2 text-sm"
              >
                <option value="">{t('skills.noProfile')}</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {availablePrerequisites.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('skills.prerequisites')}</p>
              <div className="max-h-40 overflow-y-auto rounded border p-2 space-y-1">
                {availablePrerequisites.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prerequisiteIds?.includes(s.id) ?? false}
                      onChange={() => togglePrerequisite(s.id)}
                      className="h-4 w-4"
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
          )}
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
