import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchGoals } from '@/api/goals';
import type { Goal } from '@/api/goals';

function StatusBadge({ status }: { status: Goal['status'] }) {
  const { t } = useTranslation();
  const styles: Record<Goal['status'], string> = {
    Active: 'bg-blue-100 text-blue-800',
    ReadyForValidation: 'bg-yellow-100 text-yellow-800',
    Validated: 'bg-green-100 text-green-800',
    Abandoned: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {t(`roadmap.status.${status}`)}
    </span>
  );
}

function LevelDots({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`size-2.5 rounded-full ${i < current ? 'bg-primary' : 'bg-muted'}`} />
      ))}
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{goal.skill.name}</p>
          {goal.skill.category && <p className="text-xs text-muted-foreground">{goal.skill.category}</p>}
        </div>
        <StatusBadge status={goal.status} />
      </div>

      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{t('roadmap.targetLevel', { level: goal.targetLevel })}</p>
        <LevelDots current={goal.targetLevel} max={goal.skill.maxLevel} />
      </div>

      {goal.dueDate && (
        <p className="text-xs text-muted-foreground">
          {t('roadmap.dueDate')}: {new Date(goal.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export function Roadmap() {
  const { t } = useTranslation();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: fetchGoals,
  });

  if (isLoading) {
    return <div>{t('common.loading')}</div>;
  }

  const activeGoals = goals?.filter((g) => g.status === 'Active' || g.status === 'ReadyForValidation') ?? [];
  const completedGoals = goals?.filter((g) => g.status === 'Validated') ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('roadmap.title')}</h1>
      </div>

      {activeGoals.length === 0 && completedGoals.length === 0 && (
        <p className="text-muted-foreground">{t('roadmap.noGoals')}</p>
      )}

      {activeGoals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('roadmap.currentFocus')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">{t('roadmap.completed')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
