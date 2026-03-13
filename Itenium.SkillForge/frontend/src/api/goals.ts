import api from './client';
import type { Skill } from './skills';

export type GoalStatus = 'Active' | 'ReadyForValidation' | 'Validated' | 'Abandoned';

export interface Goal {
  id: number;
  coachId: string;
  consultantId: string;
  skillId: number;
  skill: Skill;
  targetLevel: number;
  status: GoalStatus;
  dueDate: string | null;
  createdAt: string;
}

export async function fetchGoals(): Promise<Goal[]> {
  const response = await api.get<Goal[]>('/api/goal');
  return response.data;
}
