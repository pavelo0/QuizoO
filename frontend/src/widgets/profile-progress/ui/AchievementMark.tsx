import type { AchievementId } from '@/entities/experience';
import type { ReactNode } from 'react';

type MarkProps = {
  id: AchievementId;
  earned: boolean;
};

function Frame({ earned, children }: { earned: boolean; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={
        earned
          ? 'size-14 text-(--primary-accent)'
          : 'size-14 text-(--text-secondary)'
      }
    >
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="16"
        fill={earned ? 'currentColor' : 'none'}
        fillOpacity={earned ? 0.12 : 0}
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={earned ? 1 : 0.55}
      >
        {children}
      </g>
    </svg>
  );
}

export function AchievementMark({ id, earned }: MarkProps) {
  if (id === 'first-flashcard') {
    return (
      <Frame earned={earned}>
        <rect x="18" y="22" width="22" height="16" rx="3" />
        <path d="M26 22v16M24 18h22a3 3 0 0 1 3 3v16" />
      </Frame>
    );
  }
  if (id === 'first-quiz') {
    return (
      <Frame earned={earned}>
        <circle cx="32" cy="32" r="12" />
        <path d="M26.5 32.5 30 36l8-9" />
      </Frame>
    );
  }
  if (id === 'first-retry') {
    return (
      <Frame earned={earned}>
        <path d="M42 28a10 10 0 1 0 1.5 8" />
        <path d="M42 22v6h-6" />
      </Frame>
    );
  }
  if (id === 'first-assignment') {
    return (
      <Frame earned={earned}>
        <circle cx="26" cy="32" r="5" />
        <path d="M31 32h14M40 32v4M44 32v3" />
      </Frame>
    );
  }
  if (id === 'first-set') {
    return (
      <Frame earned={earned}>
        <path d="M18 26h10l2 3h16v15H18z" />
        <path d="M18 26v-2h8l2 2" />
      </Frame>
    );
  }
  if (id === 'five-studies') {
    return (
      <Frame earned={earned}>
        <path d="M32 44c8-6 12-10 12-16a6 6 0 0 0-12-2 6 6 0 0 0-12 2c0 6 4 10 12 16z" />
      </Frame>
    );
  }
  if (id === 'perfect-quiz') {
    return (
      <Frame earned={earned}>
        <path d="M32 18l3.2 7.2L43 26.4l-5.6 5 1.6 8.2L32 35.4 25 39.6l1.6-8.2-5.6-5 7.8-1.2z" />
      </Frame>
    );
  }
  return (
    <Frame earned={earned}>
      <circle cx="32" cy="32" r="12" />
      <path d="M26.5 32.5 30 36l8-9" />
      <path d="M44 20v6h-6" />
    </Frame>
  );
}
