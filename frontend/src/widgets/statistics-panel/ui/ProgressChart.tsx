import { formatDay } from './formatSession';

export function ProgressChart({
  points,
  locale,
  t,
}: {
  points: Array<{ date: string; score: number }>;
  locale: string;
  t: (key: 'statistics.emptyQuizSeries') => string;
}) {
  if (points.length < 1) {
    return (
      <div className="grid h-56 place-items-center text-sm text-(--text-secondary)">
        {t('statistics.emptyQuizSeries')}
      </div>
    );
  }

  const width = 820;
  const height = 240;
  const padding = 22;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const max = 100;
  const min = 0;

  const withCoords = points.map((point, index) => {
    const x =
      padding +
      (points.length === 1
        ? innerW / 2
        : (index / (points.length - 1)) * innerW);
    const y = padding + ((max - point.score) / (max - min)) * innerH;
    return { ...point, x, y };
  });

  const path = withCoords
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="relative h-56 w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <defs>
          <linearGradient id="quizo-line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--primary-accent)"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="var(--primary-accent)"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[25, 50, 75].map((level) => {
          const y = padding + ((max - level) / (max - min)) * innerH;
          return (
            <line
              key={level}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="var(--border-default)"
              strokeDasharray="4 6"
              strokeWidth="1"
            />
          );
        })}

        <path
          d={path}
          fill="none"
          stroke="var(--primary-accent)"
          strokeWidth="3"
        />

        {withCoords.length > 1 ? (
          <path
            d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#quizo-line-fill)"
          />
        ) : null}

        {withCoords.map((point) => (
          <circle
            key={`${point.date}-${point.score}`}
            cx={point.x}
            cy={point.y}
            r="4.5"
            fill="var(--primary-accent)"
            stroke="var(--surface-color)"
            strokeWidth="2"
          />
        ))}

        {withCoords.map((point, index) => {
          if (
            withCoords.length > 1 &&
            index % Math.max(1, Math.floor(withCoords.length / 4)) !== 0
          ) {
            return null;
          }
          return (
            <text
              key={`${point.date}-label`}
              x={point.x}
              y={height - 6}
              fill="var(--text-secondary)"
              fontSize="10"
              textAnchor="middle"
            >
              {formatDay(point.date, locale)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
