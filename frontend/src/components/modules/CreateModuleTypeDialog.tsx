import { Button } from '@/components/ui/button';
import { useI18n } from '@/i18n/useI18n';
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
  const { t } = useI18n();
  const icon: ReactNode =
    format === 'flashcard' ? (
      <Layers className="size-6" strokeWidth={2} />
    ) : (
      <ListChecks className="size-6" strokeWidth={2} />
    );

  const ctaLabel =
    format === 'flashcard'
      ? t('createDialog.createFlashcards')
      : t('createDialog.createQuiz');

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-(--border-default) bg-(--surface-color) p-6 shadow-sm',
        'transition-[box-shadow,border-color] duration-200 ease-out',
        'hover:border-(--primary-accent)/28',
        'hover:shadow-[0_4px_14px_rgba(108,99,255,0.12)]',
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
  const { t } = useI18n();
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
            'fixed inset-0 z-50 bg-[rgba(12,10,22,0.78)]',
            'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
            'data-[state=open]:motion-safe:fade-in-0 data-[state=closed]:motion-safe:fade-out-0',
            'duration-150 ease-linear',
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-1/2 left-1/2 z-100 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2',
            'rounded-3xl border border-(--border-default) bg-(--surface-color) p-6 shadow-xl md:p-8',
            'text-(--text-primary) outline-none will-change-transform',
            'data-[state=open]:motion-safe:animate-in data-[state=closed]:motion-safe:animate-out',
            'data-[state=open]:motion-safe:fade-in-0 data-[state=closed]:motion-safe:fade-out-0',
            'data-[state=open]:motion-safe:zoom-in-95 data-[state=closed]:motion-safe:zoom-out-95',
            'duration-150 ease-out',
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogPrimitive.Close asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute top-4 right-4 z-10 size-11 rounded-full border-(--border-default) bg-(--surface-color) text-(--text-primary) shadow-md hover:bg-(--input-bg)"
              aria-label={t('aria.closeDialog')}
            >
              <X className="size-5" strokeWidth={2} aria-hidden />
            </Button>
          </DialogPrimitive.Close>
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <DialogPrimitive.Title className="max-w-lg font-(family-name:--font-syne) text-2xl font-bold tracking-[0.02em] text-(--text-primary) md:text-3xl">
              {t('createDialog.title')}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="max-w-md text-sm text-(--text-secondary)">
              {t('createDialog.description')}
            </DialogPrimitive.Description>
          </div>
          <section
            aria-label={t('aria.moduleFormats')}
            className="grid gap-4 md:grid-cols-2 md:gap-5"
          >
            <FormatCard
              format="flashcard"
              title={t('createDialog.flashcardsTitle')}
              description={t('createDialog.flashcardsDescription')}
              onContinue={onFlashContinue}
            />
            <FormatCard
              format="quiz"
              title={t('createDialog.quizTitle')}
              description={t('createDialog.quizDescription')}
              onContinue={onQuizContinue}
            />
          </section>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const CreateModuleTypeDialog = memo(
  CreateModuleTypeDialogInner,
  (prev, next) =>
    prev.open === next.open &&
    prev.onOpenChange === next.onOpenChange &&
    prev.onContinue === next.onContinue,
);
CreateModuleTypeDialog.displayName = 'CreateModuleTypeDialog';
