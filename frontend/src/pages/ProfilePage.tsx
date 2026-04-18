import { Button } from '@/components/ui';
import { useClerk } from '@clerk/react';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    try {
      await signOut();
      toast.success('You have signed out.', { duration: 3500 });
      navigate('/', { replace: true });
    } catch {
      toast.error('Could not sign out. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-(family-name:--font-syne) text-3xl font-extrabold tracking-[-0.02em] text-(--text-primary)">
          Profile
        </h1>
        <p className="mt-2 max-w-lg font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          Your account and session.
        </p>
      </div>

      <section
        className="rounded-2xl border border-(--border-default) bg-(--bg-color) p-5"
        aria-labelledby="profile-session-heading"
      >
        <h2
          id="profile-session-heading"
          className="font-(family-name:--font-dm-sans) text-sm font-semibold text-(--text-primary)"
        >
          Session
        </h2>
        <p className="mt-1 font-(family-name:--font-dm-sans) text-sm text-(--text-secondary)">
          Sign out and return to the home page. Your session will end on this
          device.
        </p>
        <Button
          type="button"
          variant="outlineSoft"
          size="outlineCompact"
          className="mt-4 gap-2"
          onClick={handleLogout}
          disabled={pending}
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          {pending ? 'Signing out…' : 'Log out'}
        </Button>
      </section>
    </div>
  );
};

export default ProfilePage;
