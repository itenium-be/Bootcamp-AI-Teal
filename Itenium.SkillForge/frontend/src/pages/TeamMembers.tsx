import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { sortUsers } from './teamMembersUtils';
import { fetchUsers, fetchSkillProfiles, assignUserProfile } from '@/api/client';

export function TeamMembers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['skillProfiles'],
    queryFn: fetchSkillProfiles,
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId, profileId }: { userId: string; profileId: number | null }) =>
      assignUserProfile(userId, profileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('teamMembers.profileAssigned'));
    },
    onError: () => toast.error(t('teamMembers.profileAssignFailed')),
  });

  function handleProfileChange(userId: string, value: string) {
    const profileId = value === '' ? null : parseInt(value);
    assignMutation.mutate({ userId, profileId });
  }

  if (usersLoading || profilesLoading) {
    return <div>{t('common.loading')}</div>;
  }

  const sorted = sortUsers(users);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('teamMembers.title')}</h1>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">{t('teamMembers.name')}</th>
              <th className="p-3 text-left font-medium">{t('teamMembers.email')}</th>
              <th className="p-3 text-left font-medium">{t('teamMembers.profile')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-3">{user.name || '-'}</td>
                <td className="p-3 text-muted-foreground">{user.email || '-'}</td>
                <td className="p-3">
                  <select
                    value={user.profileId?.toString() ?? ''}
                    onChange={(e) => handleProfileChange(user.id, e.target.value)}
                    className="rounded border px-2 py-1 text-sm"
                    aria-label={t('teamMembers.assignProfile')}
                  >
                    <option value="">{t('teamMembers.noProfile')}</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id.toString()}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={3} className="p-3 text-center text-muted-foreground">
                  {t('teamMembers.noMembers')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
