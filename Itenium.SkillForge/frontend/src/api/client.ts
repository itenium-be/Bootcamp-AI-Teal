import axios from 'axios';
import { useAuthStore } from '../stores';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  params.append('client_id', 'skillforge-spa');
  params.append('scope', 'openid profile email');

  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/connect/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data;
}

interface Team {
  id: number;
  name: string;
}

export async function fetchUserTeams(): Promise<Team[]> {
  const response = await api.get<Team[]>('/api/team');
  return response.data;
}

export interface Course {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  level: string | null;
}

interface CoursePayload {
  name: string;
  description: string | null;
  category: string | null;
  level: string | null;
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await api.get<Course[]>('/api/course');
  return response.data;
}

interface Stats {
  totalCourses: number;
  activeConsultants: number;
  activeGoals: number;
}

export async function fetchStats(): Promise<Stats> {
  const response = await api.get<Stats>('/api/stats');
  return response.data;
}

export async function createCourse(data: CoursePayload): Promise<Course> {
  const response = await api.post<Course>('/api/course', data);
  return response.data;
}

export async function updateCourse(id: number, data: CoursePayload): Promise<Course> {
  const response = await api.put<Course>(`/api/course/${id}`, data);
  return response.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await api.delete(`/api/course/${id}`);
}

export interface SkillProfile {
  id: number;
  name: string;
  skills?: Skill[];
}

export interface Skill {
  id: number;
  name: string;
  category: string | null;
  description: string | null;
  levelCount: number;
  isUniversal: boolean;
  profileId: number | null;
}

interface SkillPayload {
  name: string;
  category: string | null;
  description: string | null;
  levelCount: number;
  isUniversal: boolean;
  profileId: number | null;
}

export async function fetchSkillProfiles(): Promise<SkillProfile[]> {
  const response = await api.get<SkillProfile[]>('/api/skill-profile');
  return response.data;
}

export async function createSkillProfile(data: { name: string }): Promise<SkillProfile> {
  const response = await api.post<SkillProfile>('/api/skill-profile', data);
  return response.data;
}

export async function updateSkillProfile(id: number, data: { name: string }): Promise<SkillProfile> {
  const response = await api.put<SkillProfile>(`/api/skill-profile/${id}`, data);
  return response.data;
}

export async function deleteSkillProfile(id: number): Promise<void> {
  await api.delete(`/api/skill-profile/${id}`);
}

export async function fetchSkills(profileId?: number): Promise<Skill[]> {
  const params = profileId !== undefined ? `?profileId=${profileId}` : '';
  const response = await api.get<Skill[]>(`/api/skill${params}`);
  return response.data;
}

export async function createSkill(data: SkillPayload): Promise<Skill> {
  const response = await api.post<Skill>('/api/skill', data);
  return response.data;
}

export async function updateSkill(id: number, data: SkillPayload): Promise<Skill> {
  const response = await api.put<Skill>(`/api/skill/${id}`, data);
  return response.data;
}

export async function deleteSkill(id: number): Promise<void> {
  await api.delete(`/api/skill/${id}`);
}

export async function addSkillDependency(skillId: number, prerequisiteSkillId: number): Promise<void> {
  await api.post(`/api/skill/${skillId}/dependencies`, { prerequisiteSkillId });
}
