import TestComponent from '@/components/TestComponent';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return <TestComponent />;
}
