import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useTeamStore } from '@/stores';
import { fetchStats } from '@/api/client';
import { DashboardStats } from '@/components/DashboardStats';

export function Dashboard() {
  const { t } = useTranslation();
  const { mode, selectedTeam } = useTeamStore();

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <p className="text-muted-foreground">
          {t('dashboard.welcome')}
          {mode === 'manager' && selectedTeam && ` - ${selectedTeam.name}`}
        </p>
      </div>

      <DashboardStats
        totalCourses={stats?.totalCourses ?? 0}
        activeConsultants={stats?.activeConsultants ?? 0}
        activeGoals={stats?.activeGoals ?? 0}
      />
    </div>
  );
}
