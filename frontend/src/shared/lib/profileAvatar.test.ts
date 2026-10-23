import { describe, expect, it } from 'vitest';
import {
  profileAvatarBackground,
  profileAvatarHue,
  profileDisplayInitial,
} from './profileAvatar';

describe('profileAvatar', () => {
  it('стабильно красит одну и ту же строку', () => {
    expect(profileAvatarHue('ann')).toBe(profileAvatarHue('ann'));
    expect(profileAvatarBackground('ann')).toMatch(/^hsl\(\d+ 52% 44%\)$/);
  });

  it('берёт первую букву имени, иначе почты', () => {
    expect(profileDisplayInitial(' ann ', 'a@b.c')).toBe('A');
    expect(profileDisplayInitial('  ', 'quiz@quizoo.test')).toBe('Q');
    expect(profileDisplayInitial(null, '  ')).toBe('?');
  });
});
