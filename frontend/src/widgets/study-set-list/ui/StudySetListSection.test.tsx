import { createStudySet } from '@/entities/study-set';
import type { StudySetSummary } from '@/entities/study-set';
import { renderWithI18n, renderWithProviders } from '@/shared/test/render';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { StudySetListSection } from './StudySetListSection';

vi.mock('@/entities/study-set', async () => {
  const actual = await vi.importActual<typeof import('@/entities/study-set')>(
    '@/entities/study-set',
  );
  return { ...actual, createStudySet: vi.fn() };
});

const set: StudySetSummary = {
  id: 'set-1',
  title: 'Biology exam',
  moduleCount: 2,
  studiedCount: 1,
  progress: 50,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
};

function renderSets(sets: StudySetSummary[] = []) {
  const onCreated = vi.fn();
  renderWithProviders(
    <Routes>
      <Route
        path="/"
        element={
          <StudySetListSection
            sets={sets}
            loading={false}
            onCreated={onCreated}
          />
        }
      />
      <Route path="/app/sets/:setId" element={<p>set page</p>} />
    </Routes>,
    '/',
  );
  return onCreated;
}

describe('StudySetListSection', () => {
  beforeEach(() => {
    vi.mocked(createStudySet).mockReset();
  });

  it('показывает пустой список и создаёт набор', async () => {
    const user = userEvent.setup();
    const onCreated = renderSets();
    expect(screen.getByText('No sets yet')).toBeInTheDocument();
    vi.mocked(createStudySet).mockResolvedValue(set);
    await user.click(screen.getByRole('button', { name: 'New set' }));
    await user.type(screen.getByLabelText('Set name'), 'Biology exam');
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'New set',
      }),
    );
    expect(createStudySet).toHaveBeenCalledWith('Biology exam');
    expect(onCreated).toHaveBeenCalledWith(set);
  });

  it('открывает набор', async () => {
    const user = userEvent.setup();
    renderWithI18n(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route
            path="/app"
            element={
              <StudySetListSection
                sets={[set]}
                loading={false}
                onCreated={vi.fn()}
              />
            }
          />
          <Route path="/app/sets/:setId" element={<p>set page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('link', { name: /Biology exam/i }));
    expect(await screen.findByText('set page')).toBeInTheDocument();
  });
});
