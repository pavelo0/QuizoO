import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="">
      <div className="">
        <h1>Home Page</h1>
      </div>
    </div>
  );
}
