import { Footer, Header } from '@/widgets/service-shell';

import { Outlet } from 'react-router-dom';

export default function LandingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
