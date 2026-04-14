import { Button } from '@/components/ui';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.02em] text-(--text-primary)">
          Settings
        </h1>
        <p className="mt-2 max-w-lg font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          Account preferences and session.
        </p>
      </div>

      <section
        className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-5"
        aria-labelledby="settings-session-heading"
      >
        <h2
          id="settings-session-heading"
          className="font-(family-name:--font-dm-sans) text-sm font-semibold text-(--text-primary)"
        >
          Session
        </h2>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          Sign out and return to the login screen.
        </p>
        <Button
          type="button"
          variant="outlineSoft"
          size="outlineCompact"
          className="mt-4 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          Log out
        </Button>
      </section>
    </div>
  );
};

export default SettingsPage;
