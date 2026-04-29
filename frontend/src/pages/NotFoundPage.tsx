import { Button } from '@/components/ui';
import { Home, LayoutDashboard, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

type NotFoundPageProps = {
  inService?: boolean;
};

export default function NotFoundPage({ inService = false }: NotFoundPageProps) {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center">
      <section className="w-full max-w-2xl rounded-3xl border border-(--border-default) bg-(--surface-color) p-8 shadow-sm">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-(--primary-accent)/15 text-(--primary-accent)">
            <Search className="size-7" strokeWidth={1.8} />
          </div>

          <p className="font-(family-name:--font-jetbrains-mono) text-xs font-semibold uppercase tracking-[0.14em] text-(--text-secondary)">
            Error 404
          </p>
          <h1 className="mt-2 font-(family-name:--font-syne) text-4xl font-extrabold tracking-[-0.03em] text-(--text-primary) sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-(--text-secondary) sm:text-base">
            The page you are looking for does not exist, was moved, or the URL
            is incorrect.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              variant="cta"
              size="outlineCompact"
              className="gap-2"
            >
              <Link to="/">
                <Home className="size-4" strokeWidth={1.75} />
                Go home
              </Link>
            </Button>

            <Button
              asChild
              variant={inService ? 'cta' : 'outlineSoft'}
              size="outlineCompact"
              className="gap-2"
            >
              <Link to="/app">
                <LayoutDashboard className="size-4" strokeWidth={1.75} />
                Go to dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
