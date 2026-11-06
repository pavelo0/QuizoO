import { fetchModuleList, type ModuleListItem } from '@/entities/module';
import {
  fetchQuizAssignmentList,
  type QuizAssignmentSummary,
} from '@/entities/quiz-assignment';
import { fetchStudySetList, type StudySetSummary } from '@/entities/study-set';
import { useAuthContext } from '@/features/auth-session';
import { Button } from '@/shared/ui/button';
import { apiErrorMessage } from '@/shared/lib/apiErrorMessage';
import { useI18n } from '@/shared/i18n/useI18n';
import { DashboardModulesSection } from '@/widgets/dashboard-module-list';
import { QuizAssignmentListSection } from '@/widgets/quiz-assignment-list';
import { StudySetListSection } from '@/widgets/study-set-list';
import { useCallback, useEffect, useMemo, useState } from 'react';

const DashboardPage = () => {
  const { t } = useI18n();
  const { user } = useAuthContext();
  const isAdmin = user?.role === 'ADMIN';
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [studySets, setStudySets] = useState<StudySetSummary[]>([]);
  const [assignments, setAssignments] = useState<QuizAssignmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const load = useCallback(async () => {
    if (isAdmin) {
      setModules([]);
      setStudySets([]);
      setAssignments([]);
      setLoadError(null);
      setLoading(false);
      return;
    }
    setLoadError(null);
    setLoading(true);
    try {
      const [moduleRows, setRows, assignmentRows] = await Promise.all([
        fetchModuleList(),
        fetchStudySetList(),
        fetchQuizAssignmentList(),
      ]);
      setModules(moduleRows);
      setStudySets(setRows);
      setAssignments(assignmentRows);
    } catch (e) {
      setLoadError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const handleModuleDeleted = useCallback(async () => {
    await load();
  }, [load]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter((m) => {
      const title = m.title.toLowerCase();
      const description = (m.description ?? '').toLowerCase();
      return title.includes(q) || description.includes(q);
    });
  }, [modules, search]);

  return (
    <div className="font-(family-name:--font-dm-sans)">
      {loadError && (
        <div
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p>{loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => void load()}
          >
            {t('common.retry')}
          </Button>
        </div>
      )}

      {!isAdmin && (
        <StudySetListSection
          sets={studySets}
          loading={loading}
          onCreated={(created) =>
            setStudySets((current) => [created, ...current])
          }
        />
      )}

      {!isAdmin && (
        <QuizAssignmentListSection
          assignments={assignments}
          modules={modules}
          loading={loading}
        />
      )}

      <DashboardModulesSection
        modules={modules}
        filteredModules={filteredModules}
        loading={loading}
        search={search}
        canCreate={!isAdmin}
        onSearchChange={handleSearchChange}
        onModuleDeleted={handleModuleDeleted}
      />
    </div>
  );
};

export default DashboardPage;
