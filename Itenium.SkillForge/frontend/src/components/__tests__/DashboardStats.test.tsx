import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { DashboardStats } from '../DashboardStats';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@itenium-forge/ui', () => {
  const S = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    Card: S,
    CardHeader: S,
    CardTitle: S,
    CardContent: S,
  };
});

vi.mock('lucide-react', () => {
  const I = () => <span />;
  return { BookOpen: I, Users: I, Award: I };
});

describe('DashboardStats', () => {
  it('renders total courses count', () => {
    render(<DashboardStats totalCourses={12} activeConsultants={5} activeGoals={3} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders active consultants count', () => {
    render(<DashboardStats totalCourses={0} activeConsultants={7} activeGoals={0} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders active goals count', () => {
    render(<DashboardStats totalCourses={0} activeConsultants={0} activeGoals={4} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders all three stats at once', () => {
    render(<DashboardStats totalCourses={10} activeConsultants={20} activeGoals={30} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders translation keys for labels', () => {
    render(<DashboardStats totalCourses={0} activeConsultants={0} activeGoals={0} />);
    expect(screen.getByText('dashboard.totalCourses')).toBeInTheDocument();
    expect(screen.getByText('dashboard.activeConsultants')).toBeInTheDocument();
    expect(screen.getByText('dashboard.activeGoals')).toBeInTheDocument();
  });
});
