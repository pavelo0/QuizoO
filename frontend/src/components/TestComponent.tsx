import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';

const TestComponent = () => {
  const [count, setCount] = useState<number>(0);
  const [lastClickId, setLastClickId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    setError(null);
    const res = await fetch('/api/clicks');
    if (!res.ok) throw new Error(`GET /api/clicks failed (${res.status})`);
    const data: number = await res.json();
    setCount(data);
  };

  const handleAddClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/click', { method: 'POST' });
      if (!res.ok) throw new Error(`POST /api/click failed (${res.status})`);
      const created: { id: string } = await res.json();
      setLastClickId(created.id);
      await fetchCount();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCount().catch((e) =>
      setError(e instanceof Error ? e.message : 'Unknown error'),
    );
  }, []);

  return (
    <Card className="max-w-xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-lg font-bold">
            Backend + Prisma + Postgres test
          </div>
          <div className="text-sm opacity-80">Кликов: {count}</div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAddClick} disabled={loading}>
            {loading ? 'Sending...' : 'POST /api/click'}
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchCount().catch((e) => setError(String(e)))}
            disabled={loading}
          >
            GET /api/clicks
          </Button>
        </div>

        <div className="text-sm opacity-80">
          Last click id: {lastClickId ?? '—'}
        </div>

        <div className="text-xs opacity-60">
          Uses Vite proxy: <code>/api</code> →{' '}
          <code>http://localhost:3001</code>
        </div>
      </div>
    </Card>
  );
};

export default TestComponent;
