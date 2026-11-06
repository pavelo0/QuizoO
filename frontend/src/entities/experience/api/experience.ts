import { apiClient } from '@/shared/api/client';
import type { ExperienceProfile } from '../model/types';

export async function fetchExperienceProfile() {
  const { data } = await apiClient.get<ExperienceProfile>('/experience/me');
  return data;
}
