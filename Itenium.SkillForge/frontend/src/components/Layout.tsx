import { useState, useEffect } from 'react';
import { Outlet, Link, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Avatar,
  AvatarFallback,
  ScrollArea,
} from '@itenium-forge/ui';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Sun,
  Moon,
  Component,
  ChevronsUpDown,
  Briefcase,
  Search,
  BookOpen,
  GraduationCap,
  Award,
  Settings,
  Library,
  TrendingUp,
  BarChart3,
  ClipboardList,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore, useTeamStore, useThemeStore, type Team } from '@/stores';
import { fetchUserTeams } from '@/api/client';

const languages = [
  { code: 'nl', name: 'NL' },
  { code: 'en', name: 'EN' },
];

function TeamSwitcher() {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const { user } = useAuthStore();
  const { mode, setMode, selectedTeam, setSelectedTeam, teams } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState('');
  const isBackOffice = user?.isBackOffice ?? false;
  const isLearner = !isBackOffice && teams.length === 0;

  const filteredTeams = teams.filter((team) => team.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getDisplayName = () => {
    if (isLearner) return t('app.learner');
    if (mode === 'backoffice') return t('app.backoffice');
    return selectedTeam?.name || '';
  };

  const getIcon = () => {
    if (isLearner) return <GraduationCap className="size-4" />;
    if (mode === 'backoffice') return <Briefcase className="size-4" />;
    return <Component className="size-4" />;
  };

  // Disable switcher if user is learner or only has access to one team and is not backoffice
  const canSwitch = !isLearner && (isBackOffice || teams.length > 1);

  const handleSelectBackOffice = () => {
    setMode('backoffice');
    setSearchQuery('');
  };

  const handleSelectTeam = (team: Team) => {
    setMode('manager');
    setSelectedTeam(team);
    setSearchQuery('');
  };

  const buttonContent = (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        {getIcon()}
      </div>
      <div className="grid flex-1 text-start text-sm leading-tight">
        <span className="truncate font-semibold">{t('app.title')}</span>
        <span className="truncate text-xs">{getDisplayName()}</span>
      </div>
      {canSwitch && <ChevronsUpDown className="ms-auto size-4" />}
    </>
  );

  // If user cannot switch (learner or single team), show static display without dropdown
  if (!canSwitch) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default">
            {buttonContent}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {buttonContent}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="pl-8 h-8"
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            {isBackOffice && (
              <>
                <DropdownMenuItem onClick={handleSelectBackOffice} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Briefcase className="size-4 shrink-0" />
                  </div>
                  <span className="font-medium">{t('app.backoffice')}</span>
                  {mode === 'backoffice' && (
                    <span className="ml-auto text-xs text-muted-foreground">{t('common.active')}</span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {isBackOffice && (
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t('app.teams')}</DropdownMenuLabel>
            )}
            <ScrollArea className="max-h-[200px]">
              {filteredTeams.map((team) => (
                <DropdownMenuItem key={team.id} onClick={() => handleSelectTeam(team)} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Component className="size-4 shrink-0" />
                  </div>
                  {team.name}
                  {mode === 'manager' && selectedTeam?.id === team.id && (
                    <span className="ml-auto text-xs text-muted-foreground">{t('common.active')}</span>
                  )}
                </DropdownMenuItem>
              ))}
              {filteredTeams.length === 0 && (
                <div className="p-2 text-sm text-muted-foreground text-center">{t('common.noResults')}</div>
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function Layout() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { resolvedTheme, setTheme } = useThemeStore();
  const { mode, setTeams } = useTeamStore();

  const isBackOffice = user?.isBackOffice ?? false;

  // Fetch teams on mount
  const { data: teams } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchUserTeams,
  });

  useEffect(() => {
    if (teams) {
      setTeams(teams, isBackOffice);
    }
  }, [teams, isBackOffice, setTeams]);

  const handleLogout = () => {
    logout();
    router.navigate({ to: '/sign-in' });
  };

  // Determine if user is learner only (no team management access)
  const isLearnerOnly = !isBackOffice && (!teams || teams.length === 0);

  // Dashboard - always shown
  const dashboardItem = { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') };

  // My Learning section - shown for learners and managers
  const myLearningNavItems = [
    { path: '/my-courses', icon: BookOpen, label: t('nav.myCourses') },
    { path: '/my-progress', icon: TrendingUp, label: t('nav.myProgress') },
    { path: '/my-certificates', icon: Award, label: t('nav.myCertificates') },
  ];

  // Catalog - shown for all users
  const catalogNavItems = [{ path: '/catalog', icon: Library, label: t('nav.catalog') }];

  // Team section - shown for managers
  const teamNavItems = [
    { path: '/team/members', icon: Users, label: t('nav.teamMembers') },
    { path: '/team/progress', icon: BarChart3, label: t('nav.teamProgress') },
    { path: '/team/assignments', icon: ClipboardList, label: t('nav.assignments') },
  ];

  // Courses management - shown for managers
  const coursesNavItems = [{ path: '/courses', icon: BookOpen, label: t('nav.courses') }];

  // Administration - shown for backoffice
  const adminNavItems = [
    { path: '/courses', icon: BookOpen, label: t('nav.courses') },
    { path: '/admin/users', icon: Users, label: t('nav.users') },
    { path: '/admin/teams', icon: Component, label: t('nav.teams') },
  ];

  // Reports - shown for backoffice
  const reportsNavItems = [
    { path: '/reports/usage', icon: BarChart3, label: t('nav.usage') },
    { path: '/reports/completion', icon: CheckCircle, label: t('nav.completion') },
    { path: '/reports/feedback', icon: MessageSquare, label: t('nav.feedback') },
  ];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <TeamSwitcher />
        </SidebarHeader>

        <SidebarContent>
          {/* Dashboard - always shown */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to={dashboardItem.path} activeProps={{ className: 'bg-accent' }}>
                      <dashboardItem.icon className="size-4" />
                      <span>{dashboardItem.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* My Learning - shown for learners only */}
          {isLearnerOnly && (
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.myLearning')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {myLearningNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} activeProps={{ className: 'bg-accent' }}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Catalog - shown for all users */}
          <SidebarGroup>
            <SidebarGroupLabel>{t('nav.catalogSection')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {catalogNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} activeProps={{ className: 'bg-accent' }}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Team - shown for managers (not learners) */}
          {mode === 'manager' && !isLearnerOnly && (
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.team')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {teamNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} activeProps={{ className: 'bg-accent' }}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Courses management - shown for managers (not learners) */}
          {mode === 'manager' && !isLearnerOnly && (
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.coursesSection')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {coursesNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} activeProps={{ className: 'bg-accent' }}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Administration - shown for backoffice */}
          {mode === 'backoffice' && (
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.administration')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} activeProps={{ className: 'bg-accent' }}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Reports - shown for backoffice */}
          {mode === 'backoffice' && (
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.reports')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {reportsNavItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} activeProps={{ className: 'bg-accent' }}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="w-full">
                    <Avatar className="size-6">
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 text-left truncate">{user?.name || t('common.user')}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="size-4 mr-2" />
                      {t('nav.settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="size-4 mr-2" />
                    {t('nav.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center gap-1">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={i18n.language === lang.code ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    localStorage.setItem('language', lang.code);
                  }}
                >
                  {lang.name}
                </Button>
              ))}
            </div>

            {/* Theme Toggle */}
            <Button variant="ghost" size="sm" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
