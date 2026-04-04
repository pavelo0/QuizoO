import { Button, Card, Input, Label } from '@/components/ui';

/**
 * Временный стенд для проверки UI Kit по docs/techDesign.md.
 * Используется на главном роуте; позже заменится на лендинг из Stitch.
 */
export function UiKitPreview() {
  return (
    <div
      className="relative min-h-screen overflow-hidden px-5 py-12 md:px-6"
      style={{ backgroundColor: 'var(--bg-color)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(circle at center, rgba(108, 99, 255, 0.15) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-[1200px] space-y-12">
        <header className="space-y-3 text-center md:text-left">
          <p
            className="text-sm uppercase tracking-[0.2em] text-(--text-secondary)"
            style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            UI Kit · smoke test
          </p>
          <h1
            className="text-[clamp(2rem,5vw,4.5rem)] font-bold leading-tight tracking-[0.02em] text-(--text-primary)"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Learn smarter. Remember longer.
          </h1>
          <p
            className="max-w-2xl text-base text-(--text-secondary) md:text-lg"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
          >
            Кнопки, поля и карточки соответствуют токенам из techDesign.md;
            сетка — mobile → tablet → desktop.
          </p>
        </header>

        <section className="space-y-4">
          <h2
            className="text-xl font-bold tracking-[0.02em] text-(--text-primary) md:text-2xl"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="default" size="lg">
              Start for free
            </Button>
            <Button variant="outline" size="lg">
              See how it works
            </Button>
            <Button variant="secondary" size="sm">
              Secondary
            </Button>
            <Button variant="destructive" size="lg">
              Danger
            </Button>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <Card className="p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary-accent)]">
            <h3
              className="mb-2 text-lg font-bold text-(--text-primary)"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Interactive card
            </h3>
            <p
              className="text-sm text-(--text-secondary)"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              Hover — лёгкий подъём и фиолетовый бордер (как в спеке карточек).
            </p>
          </Card>

          <Card className="rounded-3xl p-8">
            <h3
              className="mb-4 text-xl font-bold text-(--text-primary)"
              style={{ fontFamily: 'var(--font-syne)' }}
            >
              Form preview
            </h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="ui-email">Email</Label>
                <Input
                  id="ui-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ui-error">With error</Label>
                <Input
                  id="ui-error"
                  placeholder="Invalid"
                  aria-invalid
                  defaultValue=""
                />
                <p className="text-sm text-destructive">
                  Поле обязательно для демонстрации состояния.
                </p>
              </div>
              <Button type="submit" variant="default" className="w-full">
                Log in
              </Button>
            </form>
          </Card>
        </section>

        <footer
          className="border-t border-(--border-default) pt-8 text-center text-sm text-(--text-secondary) md:text-left"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          1,200+ modules created · QuizoO
        </footer>
      </div>
    </div>
  );
}
