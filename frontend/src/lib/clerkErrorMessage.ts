type ClerkLikeError = {
  message: string;
  longMessage?: string;
  errors?: Array<{ longMessage?: string; message?: string }>;
};

export function clerkErrorMessage(error: ClerkLikeError | null): string {
  if (!error) return 'Something went wrong. Please try again.';
  const first = error.errors?.[0];
  if (first) {
    return (
      first.longMessage || first.message || error.longMessage || error.message
    );
  }
  return error.longMessage || error.message;
}
