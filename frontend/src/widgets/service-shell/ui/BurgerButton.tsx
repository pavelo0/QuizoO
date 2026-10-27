import { cn } from '@/shared/lib/utils';

type BurgerButtonProps = {
  menuOpen: boolean;
  onToggle: () => void;
  openLabel?: string;
  closeLabel?: string;
  /** id of the controlled menu dialog (for aria-controls) */
  menuId?: string;
  className?: string;
};

const BurgerButton = ({
  menuOpen,
  onToggle,
  openLabel = 'Open menu',
  closeLabel = 'Close menu',
  menuId = 'mobile-menu',
  className,
}: BurgerButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 flex-col gap-1.5 lg:hidden',
        className,
      )}
      onClick={onToggle}
      aria-label={menuOpen ? closeLabel : openLabel}
      aria-expanded={menuOpen}
      aria-controls={menuId}
    >
      <span className="block h-0.5 w-8 bg-(--burger-btn)" aria-hidden />
      <span className="block h-0.5 w-8 bg-(--burger-btn)" aria-hidden />
      <span className="block h-0.5 w-8 bg-(--burger-btn)" aria-hidden />
    </button>
  );
};

export default BurgerButton;
