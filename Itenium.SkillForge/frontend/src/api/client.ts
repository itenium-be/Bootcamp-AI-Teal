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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  teamIds: number[];
  profileId: number | null;
  profileName: string | null;
  isActive: boolean;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  teamId: number | null;
  profileId: number | null;
}

export interface UpdateUserPayload {
  role: string;
  teamId: number | null;
  profileId: number | null;
}

export interface SkillProfile {
  id: number;
  name: string;
}

export async function fetchSkillProfiles(): Promise<SkillProfile[]> {
  const response = await api.get<SkillProfile[]>('/api/skillprofile');
  return response.data;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await api.get<AdminUser[]>('/api/user');
  return response.data;
}

export async function createAdminUser(data: CreateUserPayload): Promise<AdminUser> {
  const response = await api.post<AdminUser>('/api/user', data);
  return response.data;
}

export async function updateAdminUser(id: string, data: UpdateUserPayload): Promise<AdminUser> {
  const response = await api.put<AdminUser>(`/api/user/${id}`, data);
  return response.data;
}

export async function deactivateAdminUser(id: string): Promise<void> {
  await api.post(`/api/user/${id}/deactivate`);
}
