type BurgerButtonProps = {
  menuOpen: boolean;
  onToggle: () => void;
};

const BurgerButton = ({ menuOpen, onToggle }: BurgerButtonProps) => {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 flex-col gap-1.5 lg:hidden"
      onClick={onToggle}
      aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={menuOpen}
      aria-controls="mobile-menu"
    >
      <span className="block h-0.5 w-8 bg-(--burger-btn)" aria-hidden />
      <span className="block h-0.5 w-8 bg-(--burger-btn)" aria-hidden />
      <span className="block h-0.5 w-8 bg-(--burger-btn)" aria-hidden />
    </button>
  );
};

export default BurgerButton;
