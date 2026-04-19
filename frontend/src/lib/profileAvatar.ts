/** Стабильный оттенок (0–359) из строки — например id пользователя. */
export function profileAvatarHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 360;
}

/** Фон «буквенного» аватара: достаточный контраст с белой буквой. */
export function profileAvatarBackground(seed: string): string {
  const hue = profileAvatarHue(seed);
  return `hsl(${hue} 52% 44%)`;
}

export function profileDisplayInitial(
  username: string | null | undefined,
  email: string,
): string {
  const fromName = username?.trim()?.[0];
  const ch = fromName || email.trim()[0] || '?';
  return ch.toUpperCase();
}

export const PROFILE_AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';
