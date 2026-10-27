import { QMascot } from '@/shared/ui/mascot/QMascot';
import { Badge, Button } from '@/shared/ui';
import { useI18n } from '@/shared/i18n/useI18n';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const { t } = useI18n();

  return (
    <>
      <section aria-labelledby="hero-title" className="w-full bg-(--bg-color)">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="mb-3 text-xs font-extrabold tracking-[0.12em] text-(--primary-accent) uppercase">
              {t('landing.howTitle')}
            </p>
            <h1
              id="hero-title"
              className="font-(family-name:--font-syne) text-[clamp(2.6rem,5vw,3.875rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-(--text-primary)"
            >
              {t('landing.heroLine1')}
              <span className="block text-(--primary-accent)">
                {t('landing.heroLine2')}
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-(--text-secondary) md:text-lg">
              {t('landing.heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button variant="cta" size="cta" asChild>
                <Link to="/auth/register">{t('public.getStarted')}</Link>
              </Button>
              <Link
                to="/auth/login"
                className="text-sm font-semibold text-(--primary-accent) underline-offset-4 hover:underline"
              >
                {t('landing.haveAccount')}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative min-h-[420px] rounded-[28px] border border-(--border-default) bg-(--blue-tint) p-8 pb-24 sm:p-12">
              <div className="rounded-[18px] border border-(--border-default) bg-(--surface-color) p-7 shadow-[0_12px_30px_color-mix(in_srgb,var(--primary-accent)_10%,transparent)]">
                <p className="text-xs font-extrabold tracking-[0.1em] text-(--primary-accent) uppercase">
                  {t('landing.previewQuestion')}
                </p>
                <p className="mt-3 font-(family-name:--font-syne) text-2xl font-bold">
                  {t('landing.previewTerm')}
                </p>
                <div className="mt-5 rounded-xl border border-(--border-default) bg-(--blue-tint) px-4 py-3 text-sm">
                  {t('landing.previewAnswer')}
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="rounded-xl border border-(--secondary-accent) bg-(--purple-tint) px-4 py-3 text-sm">
                    {t('landing.previewChoice')}
                  </div>
                  <div className="rounded-xl border border-(--border-default) px-4 py-3 text-sm text-(--text-secondary)">
                    {t('landing.previewChoiceAlt')}
                  </div>
                </div>
              </div>
              <p className="absolute right-6 bottom-8 inline-flex flex-col rounded-[14px] border border-(--border-default) bg-(--yellow-tint) px-5 py-3 text-xs font-semibold text-(--text-primary)">
                {t('landing.previewResult')}
              </p>
            </div>
            <QMascot className="absolute bottom-4 left-4 hidden w-20 md:block" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-2">
        <article
          id="cards"
          className="rounded-[20px] border border-(--border-default) bg-(--surface-color) p-8"
        >
          <Badge variant="flashcard">{t('modules.filterCards')}</Badge>
          <h2 className="mt-5 text-[1.75rem] font-bold tracking-[-0.03em]">
            {t('landing.featureFlashTitle')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-(--text-secondary)">
            {t('landing.featureFlashBody')}
          </p>
        </article>
        <article
          id="quizzes"
          className="rounded-[20px] border border-(--border-default) bg-(--surface-color) p-8"
        >
          <Badge variant="quiz">{t('modules.filterQuizzes')}</Badge>
          <h2 className="mt-5 text-[1.75rem] font-bold tracking-[-0.03em]">
            {t('landing.featureQuizTitle')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-(--text-secondary)">
            {t('landing.featureQuizBody')}
          </p>
        </article>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-5 py-16 text-center"
      >
        <p className="text-xs font-extrabold tracking-[0.12em] text-(--primary-accent) uppercase">
          {t('landing.howTitle')}
        </p>
        <h2 className="mt-3 font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em]">
          {t('landing.featuresTitleStart')} {t('landing.featuresTitleEnd')}
        </h2>
        <ol className="mt-10 grid list-none gap-6 text-left md:grid-cols-3">
          {[
            ['01', t('landing.step1Title'), t('landing.step1Body')],
            ['02', t('landing.step2Title'), t('landing.step2Body')],
            ['03', t('landing.step3Title'), t('landing.step3Body')],
          ].map(([n, title, body]) => (
            <li
              key={n}
              className="border-t-2 border-(--border-default) px-2 pt-6"
            >
              <p className="font-(family-name:--font-syne) text-sm font-extrabold text-(--primary-accent)">
                {n}
              </p>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-8">
        <div className="rounded-[20px] border border-(--border-default) bg-(--surface-color) p-6">
          <p className="text-sm font-semibold text-(--text-secondary)">
            {t('landing.previewCaption')}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-(--blue-tint) p-4 text-sm font-semibold">
              {t('landing.featureFlashTitle')}
            </div>
            <div className="rounded-xl bg-(--purple-tint) p-4 text-sm font-semibold">
              {t('landing.featureQuizTitle')}
            </div>
            <div className="rounded-xl bg-(--yellow-tint) p-4 text-sm font-semibold">
              {t('landing.previewResult')}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] border border-(--border-default) bg-(--blue-tint) px-8 py-9 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.03em]">
              {t('landing.finalTitle')}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-(--text-secondary)">
              {t('landing.heroSubtitle')}
            </p>
          </div>
          <Button variant="cta" size="cta" asChild>
            <Link to="/auth/register">{t('public.getStarted')}</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
