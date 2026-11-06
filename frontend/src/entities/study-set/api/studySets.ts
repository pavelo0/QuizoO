import { apiClient } from '@/shared/api/client';
import type {
  StudySetDetail,
  StudySetId,
  StudySetStat,
  StudySetSummary,
} from '../model/types';

export async function fetchStudySetStatistics() {
  const { data } = await apiClient.get<StudySetStat[]>(
    '/study-sets/statistics',
  );
  return data;
}

export async function fetchStudySetList() {
  const { data } = await apiClient.get<StudySetSummary[]>('/study-sets');
  return data;
}

export async function createStudySet(title: string) {
  const { data } = await apiClient.post<StudySetSummary>('/study-sets', {
    title,
  });
  return data;
}

export async function fetchStudySet(setId: StudySetId) {
  const { data } = await apiClient.get<StudySetDetail>(`/study-sets/${setId}`);
  return data;
}

export async function renameStudySet(setId: StudySetId, title: string) {
  const { data } = await apiClient.patch<StudySetDetail>(
    `/study-sets/${setId}`,
    { title },
  );
  return data;
}

export async function deleteStudySet(setId: StudySetId) {
  await apiClient.delete(`/study-sets/${setId}`);
}

export async function addModuleToStudySet(setId: StudySetId, moduleId: string) {
  const { data } = await apiClient.post<StudySetDetail>(
    `/study-sets/${setId}/modules`,
    { moduleId },
  );
  return data;
}

export async function removeModuleFromStudySet(
  setId: StudySetId,
  moduleId: string,
) {
  const { data } = await apiClient.delete<StudySetDetail>(
    `/study-sets/${setId}/modules/${moduleId}`,
  );
  return data;
}
