export function tStub(
  key: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return key;
  return `${key}:${JSON.stringify(vars)}`;
}
