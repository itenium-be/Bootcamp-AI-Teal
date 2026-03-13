import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@itenium-forge/ui';
import { PlusCircle, Pencil, UserX } from 'lucide-react';
import { UserForm } from './UserForm';
import type { UserFormValues } from './UserForm';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deactivateAdminUser,
  fetchUserTeams,
  fetchSkillProfiles,
} from '@/api/client';
import type { AdminUser } from '@/api/client';

export function Users() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | undefined>(undefined);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchUserTeams,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['skill-profiles'],
    queryFn: fetchSkillProfiles,
  });

  const createMutation = useMutation({
    mutationFn: (data: UserFormValues) =>
      createAdminUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        teamId: data.teamId ? parseInt(data.teamId, 10) : null,
        profileId: data.profileId ? parseInt(data.profileId, 10) : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setFormOpen(false);
      toast.success(t('users.saveSuccess'));
    },
    onError: () => toast.error(t('users.saveFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserFormValues) =>
      updateAdminUser(editUser?.id ?? '', {
        role: data.role,
        teamId: data.teamId ? parseInt(data.teamId, 10) : null,
        profileId: data.profileId ? parseInt(data.profileId, 10) : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setFormOpen(false);
      setEditUser(undefined);
      toast.success(t('users.saveSuccess'));
    },
    onError: () => toast.error(t('users.saveFailed')),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setDeactivateTarget(null);
      toast.success(t('users.deactivateSuccess'));
    },
    onError: () => toast.error(t('users.deactivateFailed')),
  });

  function handleOpenAdd() {
    setEditUser(undefined);
    setFormOpen(true);
  }

  function handleOpenEdit(user: AdminUser) {
    setEditUser(user);
    setFormOpen(true);
  }

  function handleSave(data: UserFormValues) {
    if (editUser) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  function getTeamNames(teamIds: number[]) {
    return teamIds
      .map((id) => teams.find((t) => t.id === id)?.name ?? id)
      .join(', ');
  }

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('users.title')}</h1>
        <Button onClick={handleOpenAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('users.addUser')}
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">{t('users.name')}</th>
              <th className="p-3 text-left font-medium">{t('users.email')}</th>
              <th className="p-3 text-left font-medium">{t('users.role')}</th>
              <th className="p-3 text-left font-medium">{t('users.teams')}</th>
              <th className="p-3 text-left font-medium">{t('users.profile')}</th>
              <th className="p-3 text-left font-medium">{t('users.status')}</th>
              <th className="p-3 text-left font-medium">{t('users.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.name}</td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">{user.role ? t(`users.roles.${user.role}`) : '-'}</td>
                <td className="p-3">{user.teamIds.length > 0 ? getTeamNames(user.teamIds) : '-'}</td>
                <td className="p-3">{user.profileName ?? '-'}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isActive ? t('users.active') : t('users.inactive')}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(user)}
                      aria-label={t('common.edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {user.isActive && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeactivateTarget(user)}
                        aria-label={t('users.deactivateUser')}
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users?.length === 0 && (
              <tr>
                <td colSpan={7} className="p-3 text-center text-muted-foreground">
                  {t('users.noUsers')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <UserForm
        key={editUser?.id ?? 'new'}
        user={editUser}
        teams={teams}
        profiles={profiles}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditUser(undefined);
        }}
        onSave={handleSave}
        isPending={isPending}
      />

      {deactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{t('users.deactivateUser')}</h3>
            <p className="text-muted-foreground">
              {t('users.confirmDeactivate', { name: deactivateTarget.name })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                disabled={deactivateMutation.isPending}
                onClick={() => deactivateMutation.mutate(deactivateTarget.id)}
              >
                {t('users.deactivateUser')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
