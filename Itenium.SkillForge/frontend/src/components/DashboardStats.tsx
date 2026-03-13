import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@itenium-forge/ui';

interface Props {
  totalCourses: number;
  activeConsultants: number;
  activeGoals: number;
}

export function DashboardStats({ totalCourses, activeConsultants, activeGoals }: Props) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.totalCourses')}</CardTitle>
          <BookOpen className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCourses}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.activeConsultants')}</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeConsultants}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('dashboard.activeGoals')}</CardTitle>
          <Award className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeGoals}</div>
        </CardContent>
      </Card>
    </div>
  );
}
