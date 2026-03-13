import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@itenium-forge/ui';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import type { SkillFormValues } from './SkillForm';
import { SkillForm } from './SkillForm';
import {
  fetchSkills,
  fetchSkillProfiles,
  createSkill,
  updateSkill,
  deleteSkill,
  createSkillProfile,
  updateSkillProfile,
  deleteSkillProfile,
  addSkillDependency,
} from '@/api/client';
import type { Skill, SkillProfile } from '@/api/client';

export function Skills() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Skills state
  const [skillFormOpen, setSkillFormOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | undefined>(undefined);
  const [deleteSkillTarget, setDeleteSkillTarget] = useState<Skill | null>(null);

  // Profiles state
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [editProfile, setEditProfile] = useState<SkillProfile | undefined>(undefined);
  const [deleteProfileTarget, setDeleteProfileTarget] = useState<SkillProfile | null>(null);
  const [profileNameInput, setProfileNameInput] = useState('');

  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => fetchSkills(),
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['skillProfiles'],
    queryFn: fetchSkillProfiles,
  });

  // Skill mutations
  const createSkillMutation = useMutation({
    mutationFn: async (data: SkillFormValues) => {
      const skill = await createSkill({
        name: data.name,
        category: data.category || null,
        description: data.description || null,
        levelCount: data.levelCount,
        isUniversal: data.isUniversal,
        profileId: data.profileId ? parseInt(data.profileId) : null,
      });
      for (const prereqId of data.prerequisiteIds) {
        await addSkillDependency(skill.id, prereqId);
      }
      return skill;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
      setSkillFormOpen(false);
      toast.success(t('skills.saveSuccess'));
    },
    onError: () => toast.error(t('skills.saveFailed')),
  });

  const updateSkillMutation = useMutation({
    mutationFn: async (data: SkillFormValues) => {
      const skill = await updateSkill(editSkill?.id ?? 0, {
        name: data.name,
        category: data.category || null,
        description: data.description || null,
        levelCount: data.levelCount,
        isUniversal: data.isUniversal,
        profileId: data.profileId ? parseInt(data.profileId) : null,
      });
      for (const prereqId of data.prerequisiteIds) {
        await addSkillDependency(skill.id, prereqId);
      }
      return skill;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
      setSkillFormOpen(false);
      setEditSkill(undefined);
      toast.success(t('skills.saveSuccess'));
    },
    onError: () => toast.error(t('skills.saveFailed')),
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => deleteSkill(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skills'] });
      setDeleteSkillTarget(null);
      toast.success(t('skills.deleteSuccess'));
    },
    onError: () => toast.error(t('skills.deleteFailed')),
  });

  // Profile mutations
  const createProfileMutation = useMutation({
    mutationFn: (name: string) => createSkillProfile({ name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skillProfiles'] });
      setProfileFormOpen(false);
      setProfileNameInput('');
      toast.success(t('skills.profileSaveSuccess'));
    },
    onError: () => toast.error(t('skills.profileSaveFailed')),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (name: string) => updateSkillProfile(editProfile?.id ?? 0, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skillProfiles'] });
      setProfileFormOpen(false);
      setEditProfile(undefined);
      setProfileNameInput('');
      toast.success(t('skills.profileSaveSuccess'));
    },
    onError: () => toast.error(t('skills.profileSaveFailed')),
  });

  const deleteProfileMutation = useMutation({
    mutationFn: (id: number) => deleteSkillProfile(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['skillProfiles'] });
      setDeleteProfileTarget(null);
      toast.success(t('skills.profileDeleteSuccess'));
    },
    onError: () => toast.error(t('skills.profileDeleteFailed')),
  });

  function handleOpenAddSkill() {
    setEditSkill(undefined);
    setSkillFormOpen(true);
  }

  function handleOpenEditSkill(skill: Skill) {
    setEditSkill(skill);
    setSkillFormOpen(true);
  }

  function handleSaveSkill(data: SkillFormValues) {
    if (editSkill) {
      updateSkillMutation.mutate(data);
    } else {
      createSkillMutation.mutate(data);
    }
  }

  function handleOpenAddProfile() {
    setEditProfile(undefined);
    setProfileNameInput('');
    setProfileFormOpen(true);
  }

  function handleOpenEditProfile(profile: SkillProfile) {
    setEditProfile(profile);
    setProfileNameInput(profile.name);
    setProfileFormOpen(true);
  }

  function handleSaveProfile() {
    if (editProfile) {
      updateProfileMutation.mutate(profileNameInput);
    } else {
      createProfileMutation.mutate(profileNameInput);
    }
  }

  function getProfileName(profileId: number | null) {
    if (profileId === null) return '-';
    return profiles.find((p) => p.id === profileId)?.name ?? '-';
  }

  const isSkillPending = createSkillMutation.isPending || updateSkillMutation.isPending;
  const isProfilePending = createProfileMutation.isPending || updateProfileMutation.isPending;

  if (skillsLoading || profilesLoading) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('skills.title')}</h1>

      {/* Skill Profiles */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('skills.profiles')}</h2>
          <Button onClick={handleOpenAddProfile}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('skills.addProfile')}
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">{t('skills.profileName')}</th>
                <th className="p-3 text-left font-medium">{t('skills.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b">
                  <td className="p-3">{profile.name}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditProfile(profile)}
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteProfileTarget(profile)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={2} className="p-3 text-center text-muted-foreground">
                    {t('skills.noProfiles')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('skills.skillsSection')}</h2>
          <Button onClick={handleOpenAddSkill}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('skills.addSkill')}
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">{t('skills.name')}</th>
                <th className="p-3 text-left font-medium">{t('skills.category')}</th>
                <th className="p-3 text-left font-medium">{t('skills.profile')}</th>
                <th className="p-3 text-left font-medium">{t('skills.levelCount')}</th>
                <th className="p-3 text-left font-medium">{t('skills.isUniversal')}</th>
                <th className="p-3 text-left font-medium">{t('skills.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill.id} className="border-b">
                  <td className="p-3">{skill.name}</td>
                  <td className="p-3 text-muted-foreground">{skill.category || '-'}</td>
                  <td className="p-3">{skill.isUniversal ? t('skills.universal') : getProfileName(skill.profileId)}</td>
                  <td className="p-3">{skill.levelCount}</td>
                  <td className="p-3">{skill.isUniversal ? '✓' : ''}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEditSkill(skill)}
                        aria-label={t('common.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteSkillTarget(skill)}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {skills.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-3 text-center text-muted-foreground">
                    {t('skills.noSkills')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Skill Form Sheet */}
      <SkillForm
        key={editSkill?.id ?? 'new'}
        skill={editSkill}
        profiles={profiles}
        skills={skills}
        open={skillFormOpen}
        onOpenChange={(open) => {
          setSkillFormOpen(open);
          if (!open) setEditSkill(undefined);
        }}
        onSave={handleSaveSkill}
        isPending={isSkillPending}
      />

      {/* Profile Inline Form Modal */}
      {profileFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{editProfile ? t('skills.editProfile') : t('skills.addProfile')}</h3>
            <div className="space-y-1">
              <label htmlFor="profile-name" className="text-sm font-medium">
                {t('skills.profileName')}
              </label>
              <input
                id="profile-name"
                value={profileNameInput}
                onChange={(e) => setProfileNameInput(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setProfileFormOpen(false);
                  setEditProfile(undefined);
                  setProfileNameInput('');
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button disabled={isProfilePending || !profileNameInput.trim()} onClick={handleSaveProfile}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Skill Confirmation */}
      {deleteSkillTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{t('skills.deleteSkill')}</h3>
            <p className="text-muted-foreground">{t('skills.confirmDelete', { name: deleteSkillTarget.name })}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteSkillTarget(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteSkillMutation.isPending}
                onClick={() => deleteSkillMutation.mutate(deleteSkillTarget.id)}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Confirmation */}
      {deleteProfileTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md space-y-4 rounded-lg bg-background p-6 shadow-lg">
            <h3 className="text-lg font-semibold">{t('skills.deleteProfile')}</h3>
            <p className="text-muted-foreground">
              {t('skills.confirmDeleteProfile', { name: deleteProfileTarget.name })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteProfileTarget(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteProfileMutation.isPending}
                onClick={() => deleteProfileMutation.mutate(deleteProfileTarget.id)}
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
