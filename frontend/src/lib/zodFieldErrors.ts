import type { ZodError } from 'zod';

export function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const flat = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(flat.fieldErrors)) {
    if (messages && Array.isArray(messages) && messages.length)
      out[key] = messages[0]!;
  }
  return out;
}
