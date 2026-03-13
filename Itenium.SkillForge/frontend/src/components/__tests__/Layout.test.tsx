import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { useTeamStore } from '@/stores/teamStore';
import { useThemeStore } from '@/stores/themeStore';
// eslint-disable-next-line import-x/order -- must come after vi.mock calls
import { Layout } from '../Layout';

// Mock react-i18next: return the key as the translation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Outlet: () => <div data-testid="outlet" />,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useRouter: () => ({ navigate: vi.fn() }),
}));

// Mock TanStack Query: return empty teams by default
const mockUseQuery = vi.fn().mockReturnValue({ data: undefined });
vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

// Mock the UI library with minimal stubs
// Note: vi.mock factories are hoisted, so we must define stubs inline
vi.mock('@itenium-forge/ui', () => {
  const S = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    SidebarProvider: S,
    Sidebar: S,
    SidebarHeader: S,
    SidebarContent: S,
    SidebarFooter: S,
    SidebarMenu: S,
    SidebarMenuItem: S,
    SidebarMenuButton: S,
    SidebarGroup: S,
    SidebarGroupLabel: S,
    SidebarGroupContent: S,
    SidebarInset: S,
    SidebarTrigger: S,
    useSidebar: () => ({ isMobile: false }),
    Button: S,
    Input: () => <input />,
    DropdownMenu: S,
    DropdownMenuTrigger: S,
    DropdownMenuContent: S,
    DropdownMenuItem: S,
    DropdownMenuLabel: S,
    DropdownMenuSeparator: () => <hr />,
    Avatar: S,
    AvatarFallback: S,
    ScrollArea: S,
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const I = () => <span />;
  return {
    LayoutDashboard: I,
    Users: I,
    LogOut: I,
    Sun: I,
    Moon: I,
    Component: I,
    ChevronsUpDown: I,
    Briefcase: I,
    Search: I,
    BookOpen: I,
    GraduationCap: I,
    Award: I,
    Settings: I,
    Library: I,
    TrendingUp: I,
    BarChart3: I,
    ClipboardList: I,
    MessageSquare: I,
    CheckCircle: I,
  };
});

// Mock the API client
vi.mock('@/api/client', () => ({
  fetchUserTeams: vi.fn(),
}));

function setupStores(options: {
  isBackOffice?: boolean;
  mode?: 'backoffice' | 'manager';
  teams?: { id: number; name: string }[];
  selectedTeam?: { id: number; name: string } | null;
  userName?: string;
}) {
  const {
    isBackOffice = false,
    mode = 'backoffice',
    teams = [],
    selectedTeam = null,
    userName = 'Test User',
  } = options;

  useAuthStore.setState({
    accessToken: 'fake-token',
    isAuthenticated: true,
    user: {
      id: 'user-1',
      email: 'test@test.com',
      name: userName,
      isBackOffice,
    },
  });

  useTeamStore.setState({ mode, teams, selectedTeam });
  useThemeStore.setState({ resolvedTheme: 'light', theme: 'light' });
}

beforeEach(() => {
  useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false });
  useTeamStore.setState({ mode: 'backoffice', selectedTeam: null, teams: [] });
  mockUseQuery.mockReturnValue({ data: undefined });
  localStorage.clear();
});

describe('Layout', () => {
  describe('navigation visibility', () => {
    it('always shows Dashboard', () => {
      setupStores({ isBackOffice: true });
      render(<Layout />);
      expect(screen.getByText('nav.dashboard')).toBeInTheDocument();
    });

    it('always shows Catalog section', () => {
      setupStores({ isBackOffice: false, teams: [] });
      render(<Layout />);
      expect(screen.getByText('nav.catalogSection')).toBeInTheDocument();
      expect(screen.getByText('nav.catalog')).toBeInTheDocument();
    });

    it('shows My Learning section for learner-only users', () => {
      setupStores({ isBackOffice: false, teams: [] });
      render(<Layout />);

      expect(screen.getByText('nav.myLearning')).toBeInTheDocument();
      expect(screen.getByText('nav.myCourses')).toBeInTheDocument();
      expect(screen.getByText('nav.myProgress')).toBeInTheDocument();
      expect(screen.getByText('nav.myCertificates')).toBeInTheDocument();
    });

    it('hides My Learning section for backoffice users', () => {
      setupStores({ isBackOffice: true, mode: 'backoffice' });
      render(<Layout />);
      expect(screen.queryByText('nav.myLearning')).not.toBeInTheDocument();
    });

    it('shows Administration and Reports in backoffice mode', () => {
      setupStores({ isBackOffice: true, mode: 'backoffice' });
      render(<Layout />);

      expect(screen.getByText('nav.administration')).toBeInTheDocument();
      expect(screen.getByText('nav.courses')).toBeInTheDocument();
      expect(screen.getByText('nav.skills')).toBeInTheDocument();
      expect(screen.getByText('nav.users')).toBeInTheDocument();
      expect(screen.getByText('nav.teams')).toBeInTheDocument();

      expect(screen.getByText('nav.reports')).toBeInTheDocument();
      expect(screen.getByText('nav.usage')).toBeInTheDocument();
      expect(screen.getByText('nav.completion')).toBeInTheDocument();
      expect(screen.getByText('nav.feedback')).toBeInTheDocument();
    });

    it('hides Administration and Reports in manager mode', () => {
      setupStores({
        isBackOffice: true,
        mode: 'manager',
        teams: [{ id: 1, name: 'Team A' }],
        selectedTeam: { id: 1, name: 'Team A' },
      });
      render(<Layout />);

      expect(screen.queryByText('nav.administration')).not.toBeInTheDocument();
      expect(screen.queryByText('nav.reports')).not.toBeInTheDocument();
    });

    it('shows Team and Courses sections in manager mode', () => {
      setupStores({
        isBackOffice: true,
        mode: 'manager',
        teams: [{ id: 1, name: 'Team A' }],
        selectedTeam: { id: 1, name: 'Team A' },
      });
      render(<Layout />);

      expect(screen.getByText('nav.team')).toBeInTheDocument();
      expect(screen.getByText('nav.teamMembers')).toBeInTheDocument();
      expect(screen.getByText('nav.teamProgress')).toBeInTheDocument();
      expect(screen.getByText('nav.assignments')).toBeInTheDocument();

      expect(screen.getByText('nav.coursesSection')).toBeInTheDocument();
      expect(screen.getByText('nav.courses')).toBeInTheDocument();
    });

    it('hides Team and Courses sections for learner-only users', () => {
      setupStores({ isBackOffice: false, teams: [] });
      render(<Layout />);

      expect(screen.queryByText('nav.team')).not.toBeInTheDocument();
      expect(screen.queryByText('nav.coursesSection')).not.toBeInTheDocument();
    });
  });

  describe('TeamSwitcher', () => {
    it('shows "app.learner" for learner-only users', () => {
      setupStores({ isBackOffice: false, teams: [] });
      render(<Layout />);
      expect(screen.getByText('app.learner')).toBeInTheDocument();
    });

    it('shows "app.backoffice" in backoffice mode', () => {
      setupStores({ isBackOffice: true, mode: 'backoffice' });
      render(<Layout />);
      // Appears in both the switcher button and the dropdown option
      expect(screen.getAllByText('app.backoffice').length).toBeGreaterThanOrEqual(1);
    });

    it('shows selected team name in manager mode', () => {
      setupStores({
        isBackOffice: true,
        mode: 'manager',
        teams: [{ id: 1, name: 'Team Alpha' }],
        selectedTeam: { id: 1, name: 'Team Alpha' },
      });
      render(<Layout />);
      // Appears in both the switcher button and the team list
      expect(screen.getAllByText('Team Alpha').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('user menu', () => {
    it('shows the user name', () => {
      setupStores({ userName: 'Alice' });
      render(<Layout />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('shows the first letter as avatar fallback', () => {
      setupStores({ userName: 'Bob' });
      render(<Layout />);
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });
});
