import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button, Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@itenium-forge/ui';
import type { AdminUser } from '@/api/client';

const ROLES = ['backoffice', 'manager', 'learner'] as const;

const userFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.string().min(1, { message: 'users.roleRequired' }),
  teamId: z.string(),
  profileId: z.string(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface Team {
  id: number;
  name: string;
}

interface SkillProfile {
  id: number;
  name: string;
}

interface UserFormProps {
  user?: AdminUser;
  teams: Team[];
  profiles: SkillProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UserFormValues) => void;
  isPending?: boolean;
}

export function UserForm({ user, teams, profiles, open, onOpenChange, onSave, isPending }: UserFormProps) {
  const { t } = useTranslation();
  const isEdit = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: user?.role ?? '',
      teamId: user?.teamIds[0]?.toString() ?? '',
      profileId: user?.profileId?.toString() ?? '',
    },
  });

  useEffect(() => {
    reset({
      firstName: '',
      lastName: '',
      email: '',
      role: user?.role ?? '',
      teamId: user?.teamIds[0]?.toString() ?? '',
      profileId: user?.profileId?.toString() ?? '',
    });
  }, [user, reset]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? t('users.editUser') : t('users.addUser')}</SheetTitle>
          <SheetDescription>{t('users.formDescription')}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4 py-4">
          {!isEdit && (
            <>
              <div className="space-y-1">
                <label htmlFor="firstName" className="text-sm font-medium">
                  {t('users.firstName')}
                </label>
                <input id="firstName" {...register('firstName')} className="w-full rounded border px-3 py-2 text-sm" />
                {errors.firstName && <p className="text-sm text-destructive">{t(errors.firstName.message ?? '')}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="lastName" className="text-sm font-medium">
                  {t('users.lastName')}
                </label>
                <input id="lastName" {...register('lastName')} className="w-full rounded border px-3 py-2 text-sm" />
                {errors.lastName && <p className="text-sm text-destructive">{t(errors.lastName.message ?? '')}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('users.email')}
                </label>
                <input id="email" type="email" {...register('email')} className="w-full rounded border px-3 py-2 text-sm" />
                {errors.email && <p className="text-sm text-destructive">{t(errors.email.message ?? '')}</p>}
              </div>
            </>
          )}
          <div className="space-y-1">
            <label htmlFor="role" className="text-sm font-medium">
              {t('users.role')}
            </label>
            <select id="role" {...register('role')} className="w-full rounded border px-3 py-2 text-sm">
              <option value="">{t('users.selectRole')}</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(`users.roles.${r}`)}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-sm text-destructive">{t(errors.role.message ?? '')}</p>}
          </div>
          <div className="space-y-1">
            <label htmlFor="teamId" className="text-sm font-medium">
              {t('users.teams')}
            </label>
            <select id="teamId" {...register('teamId')} className="w-full rounded border px-3 py-2 text-sm">
              <option value="">{t('users.selectTeam')}</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="profileId" className="text-sm font-medium">
              {t('users.profile')}
            </label>
            <select id="profileId" {...register('profileId')} className="w-full rounded border px-3 py-2 text-sm">
              <option value="">{t('users.selectProfile')}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
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
