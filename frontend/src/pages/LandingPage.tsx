import heroIllustration from '@/assets/welcomeSectionImage.png';
import { Button } from '@/components/ui';
import { ArrowRight, BarChart3, MoveDiagonal, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      <section
        id="hero"
        aria-labelledby="hero-title"
        className="w-full bg-(--bg-color)"
      >
        <div className="mx-auto max-w-[1320px] px-5 pb-14 pt-12 md:pb-20 md:pt-16">
          <div className="flex flex-col items-center text-center">
            <p
              className="mb-6 inline-flex items-center rounded-full border border-(--secondary-accent)/35 bg-(--secondary-accent)/10 px-4 py-1.5 font-(family-name:--font-dm-sans) text-sm font-medium text-(--secondary-accent)"
              role="status"
            >
              1,200+ modules created
            </p>

            <h1
              id="hero-title"
              className="font-(family-name:--font-syne) text-[clamp(2rem,4vw+1rem,4.5rem)] font-extrabold leading-[1.08] tracking-tight"
            >
              <span className="block text-(--text-primary)">
                Learn smarter. Remember
              </span>
              <span className="block text-(--primary-accent)">longer.</span>
            </h1>

            <p className="mt-6 max-w-2xl font-(family-name:--font-dm-sans) text-base leading-relaxed text-(--text-secondary) md:text-lg">
              Create your own modules, study with flashcards, test yourself with
              quizzes. Master any subject with ease.
            </p>

            <div
              className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
              role="group"
              aria-label="Primary actions"
            >
              <Button
                variant="cta"
                size="cta"
                className="rounded-full px-7"
                asChild
              >
                <Link
                  to="/auth/register"
                  className="inline-flex items-center justify-center gap-2"
                >
                  Start for free
                  <ArrowRight className="size-4 shrink-0" aria-hidden />
                </Link>
              </Button>
              <Button
                variant="outlineSoft"
                size="cta"
                className="rounded-full px-7"
                asChild
              >
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

            <figure className="mt-12 w-full max-w-4xl md:mt-16">
              <img
                src={heroIllustration}
                alt="Isometric illustration of study modules, flashcards, and learning progress"
                width={960}
                height={540}
                decoding="async"
                className="h-auto w-full object-contain"
              />
            </figure>
          </div>
        </div>
      </section>

      <section
        id="features"
        aria-labelledby="features-title"
        className="w-full bg-(--bg-color)"
      >
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:py-24">
          <h2
            id="features-title"
            className="text-center font-(family-name:--font-syne) text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] font-bold leading-tight text-(--text-primary)"
          >
            <span className="relative inline-block">
              <span className="text-(--text-primary)">Everything</span>
              <span
                className="absolute -bottom-1 left-0 h-1 w-full rounded-sm bg-(--primary-accent)"
                aria-hidden
              />
            </span>{' '}
            <span className="text-(--text-primary)">
              you need to learn effectively
            </span>
          </h2>

          <ul className="mt-12 grid list-none gap-6 md:mt-14 md:grid-cols-3 md:gap-8">
            <li>
              <article className="flex h-full flex-col rounded-2xl border border-(--border-default) bg-(--surface-color) p-8 text-left transition-all duration-300 hover:border-(--primary-accent)">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-(--primary-accent)/15 text-(--primary-accent)"
                  aria-hidden
                >
                  <Smartphone className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 font-(family-name:--font-syne) text-xl font-bold text-(--text-primary)">
                  Flashcard Mode
                </h3>
                <p className="mt-3 flex-1 font-(family-name:--font-dm-sans) text-base leading-relaxed text-(--text-secondary)">
                  Leverage active recall and spaced repetition with our
                  interactive, customizable flashcard system.
                </p>
              </article>
            </li>
            <li>
              <article className="flex h-full flex-col rounded-2xl border border-(--border-default) bg-(--surface-color) p-8 text-left transition-all duration-300 hover:border-(--primary-accent)">
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-(--primary-accent)/15 text-(--primary-accent)"
                  aria-hidden
                >
                  <MoveDiagonal className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 font-(family-name:--font-syne) text-xl font-bold text-(--text-primary)">
                  Quiz Mode
                </h3>
                <p className="mt-3 flex-1 font-(family-name:--font-dm-sans) text-base leading-relaxed text-(--text-secondary)">
                  Test your knowledge with AI-generated quizzes that adapt to
                  your weaknesses and reinforce key concepts.
                </p>
              </article>
            </li>
            <li>
              <article className="flex h-full flex-col rounded-2xl border border-(--border-default) bg-(--surface-color) p-8 text-left transition-all duration-300s hover:border-(--primary-accent)">
                <div
                  className="flex size-12 shrink-0 items-center justify-scenter rounded-xl bg-(--primary-accent)/15 text-(--primary-accent)"
                  aria-hidden
                >
                  <BarChart3 className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-6 font-(family-name:--font-syne) text-xl font-bold text-(--text-primary)">
                  Track Your Progress
                </h3>
                <p className="mt-3 flex-1 font-(family-name:--font-dm-sans) text-base leading-relaxed text-(--text-secondary)">
                  Visualize your learning journey with detailed analytics and
                  insights into your retention rates over time.
                </p>
              </article>
            </li>
          </ul>
        </div>
      </section>

      <section
        id="how-it-works"
        aria-labelledby="how-it-works-title"
        className="w-full bg-(--bg-color)"
      >
        <div className="mx-auto max-w-[1320px] px-5 py-16 md:py-24">
          <h2
            id="how-it-works-title"
            className="text-center font-(family-name:--font-syne) text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] font-bold leading-tight text-(--text-primary)"
          >
            How it works
          </h2>

          <ol className="mt-12 grid list-none gap-10 md:mt-14 md:grid-cols-3 md:gap-8">
            <li className="flex flex-col items-center text-center">
              <div
                className="flex size-18 shrink-0 items-center justify-center rounded-full border border-(--primary-accent)/50 bg-(--surface-color) font-(family-name:--font-syne) text-xl font-bold tabular-nums tracking-tight text-(--primary-accent)"
                aria-hidden
              >
                01
              </div>
              <h3 className="mt-6 font-(family-name:--font-syne) text-lg font-bold text-(--text-primary) md:text-xl">
                Create your module
              </h3>
              <p className="mt-3 max-w-sm font-(family-name:--font-dm-sans) text-base leading-relaxed text-(--text-secondary)">
                Import your notes or create new topics from scratch in minutes.
              </p>
            </li>
            <li className="flex flex-col items-center text-center">
              <div
                className="flex size-18 shrink-0 items-center justify-center rounded-full border border-(--primary-accent)/50 bg-(--surface-color) font-(family-name:--font-syne) text-xl font-bold tabular-nums tracking-tight text-(--primary-accent)"
                aria-hidden
              >
                02
              </div>
              <h3 className="mt-6 font-(family-name:--font-syne) text-lg font-bold text-(--text-primary) md:text-xl">
                Study with cards
              </h3>
              <p className="mt-3 max-w-sm font-(family-name:--font-dm-sans) text-base leading-relaxed text-(--text-secondary)">
                Master concepts through intuitive flashcard drills designed for
                retention.
              </p>
            </li>
            <li className="flex flex-col items-center text-center">
              <div
                className="flex size-18 shrink-0 items-center justify-center rounded-full border border-(--primary-accent)/50 bg-(--surface-color) font-(family-name:--font-syne) text-xl font-bold tabular-nums tracking-tight text-(--primary-accent)"
                aria-hidden
              >
                03
              </div>
              <h3 className="mt-6 font-(family-name:--font-syne) text-lg font-bold text-(--text-primary) md:text-xl">
                Take the quiz
              </h3>
              <p className="mt-3 max-w-sm font-(family-name:--font-dm-sans) text-base leading-relaxed text-(--text-secondary)">
                Verify your mastery with custom tests and dynamic challenge
                modes.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
