import { createFileRoute } from '@tanstack/react-router';
import { TeamMembers } from '../../pages/TeamMembers';

export const Route = createFileRoute('/_authenticated/team/members')({
  component: TeamMembers,
});
