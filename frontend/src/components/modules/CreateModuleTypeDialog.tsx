import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ModuleType } from '@/types/module';
import { ArrowRight, Layers, ListChecks, X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { memo, useCallback, type ReactNode } from 'react';

export type CreateModuleTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Выбор типа после «Continue» (навигация или следующий шаг — на стороне родителя). */
  onContinue: (type: ModuleType) => void;
};

type FormatCardProps = {
  format: 'flashcard' | 'quiz';
  title: string;
  description: string;
  onContinue: () => void;
};

const FormatCard = memo(function FormatCard({
  format,
  title,
  description,
  onContinue,
}: FormatCardProps) {
  const icon: ReactNode =
    format === 'flashcard' ? (
      <Layers className="size-6" strokeWidth={2} />
    ) : (
      <ListChecks className="size-6" strokeWidth={2} />
    );

  const ctaLabel = format === 'flashcard' ? 'Create flashcards' : 'Create quiz';

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-(--border-default) bg-(--surface-color) p-6 shadow-sm',
        'transition-[box-shadow,border-color] duration-300 ease-out',
        'hover:border-(--primary-accent)/28',
        'hover:shadow-[0_6px_22px_rgba(108,99,255,0.14)]',
      )}
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-(--primary-accent) text-white"
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-(family-name:--font-syne) text-base font-bold tracking-[0.02em] text-(--text-primary)">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-(--text-secondary)">
          {description}
        </p>
      </div>
      <Button
        type="button"
        variant="cta"
        size="outlineCompact"
        className="mt-auto h-12 w-full gap-2 rounded-xl shadow-[0_3px_14px_rgba(108,99,255,0.2)]"
        onClick={onContinue}
      >
        {ctaLabel}
        <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
      </Button>
    </article>
  );
});
FormatCard.displayName = 'FormatCard';

function CreateModuleTypeDialogInner({
  open,
  onOpenChange,
  onContinue,
}: CreateModuleTypeDialogProps) {
  const onFlashContinue = useCallback(() => {
    onContinue('FLASHCARD');
  }, [onContinue]);

  const onQuizContinue = useCallback(() => {
    onContinue('QUIZ');
  }, [onContinue]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            'create-module-dialog-overlay fixed inset-0 z-50',
            'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
            'data-[state=open]:motion-safe:fade-in-0 data-[state=closed]:motion-safe:fade-out-0',
            'duration-300 ease-in-out',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-100 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2',
            'rounded-3xl border border-(--border-default) bg-(--surface-color) p-6 shadow-xl md:p-8',
            'text-(--text-primary) outline-none',
            'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
            'data-[state=open]:motion-safe:fade-in-0 data-[state=closed]:motion-safe:fade-out-0',
            'data-[state=open]:motion-safe:zoom-in-95 data-[state=closed]:motion-safe:zoom-out-95',
            'duration-300 ease-in-out',
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 size-11 rounded-full border-(--border-default) bg-(--surface-color) text-(--text-primary) shadow-md hover:bg-(--input-bg)"
              aria-label="Close dialog"
            >
              <X className="size-5" strokeWidth={2} aria-hidden />
            </Button>
          </DialogPrimitive.Close>
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <DialogPrimitive.Title className="max-w-lg font-(family-name:--font-syne) text-2xl font-bold tracking-[0.02em] text-(--text-primary) md:text-3xl">
              Create a new module
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="max-w-md text-sm text-(--text-secondary)">
              Choose a format to start building your learning experience.
            </DialogPrimitive.Description>
          </div>
          <section
            aria-label="Module formats"
            className="grid gap-4 md:grid-cols-2 md:gap-5"
          >
            <FormatCard
              format="flashcard"
              title="Create Flashcards set"
              description="Build a deck for spaced repetition and memorization. Perfect for vocabulary and key concepts."
              onContinue={onFlashContinue}
            />
            <FormatCard
              format="quiz"
              title="Create Quiz"
              description="Test your knowledge with multiple choice and text questions. Track your progress with detailed results."
              onContinue={onQuizContinue}
            />
          </section>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const CreateModuleTypeDialog = memo(CreateModuleTypeDialogInner);
CreateModuleTypeDialog.displayName = 'CreateModuleTypeDialog';
