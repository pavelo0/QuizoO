import { Button } from '@/components/ui';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type BurgerProps = {
  phase: 'open' | 'closing';
  onDismiss: () => void;
  onExitComplete: () => void;
};

const Burger = ({ phase, onDismiss, onExitComplete }: BurgerProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (phase === 'open') {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(id);
    }
    queueMicrotask(() => setVisible(false));
  }, [phase]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const handlePanelTransitionEnd = (
    e: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (e.propertyName !== 'transform') return;
    if (phase === 'closing') onExitComplete();
  };

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Close menu"
        onClick={onDismiss}
      />

      <div
        className={`absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-(--border-default) bg-(--bg-color) shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTransitionEnd={handlePanelTransitionEnd}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-(--border-default) px-5">
          <span className="font-(family-name:--font-syne) text-xl font-bold text-(--text-primary)">
            QuizoO
          </span>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-2xl text-(--text-primary) transition-colors hover:bg-(--surface-color)"
            aria-label="Close menu"
            onClick={onDismiss}
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6"
          aria-label="Mobile"
        >
          <a
            href="#features"
            className="rounded-xl px-3 py-3 font-(family-name:--font-dm-sans) text-base font-medium text-(--text-primary) no-underline hover:bg-(--surface-color)"
            onClick={onDismiss}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="rounded-xl px-3 py-3 font-(family-name:--font-dm-sans) text-base font-medium text-(--text-primary) no-underline hover:bg-(--surface-color)"
            onClick={onDismiss}
          >
            Pricing
          </a>
          <a
            href="#how-it-works"
            className="rounded-xl px-3 py-3 font-(family-name:--font-dm-sans) text-base font-medium text-(--text-primary) no-underline hover:bg-(--surface-color)"
            onClick={onDismiss}
          >
            How it works
          </a>
        </nav>

        <div className="flex shrink-0 flex-col gap-3 border-t border-(--border-default) p-5">
          <Button variant="outlineSoft" size="cta" className="w-full" asChild>
            <Link to="/auth/login" onClick={onDismiss}>
              Log in
            </Link>
          </Button>
          <Button variant="cta" size="cta" className="w-full" asChild>
            <Link to="/auth/register" onClick={onDismiss}>
              Get started
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Burger;
