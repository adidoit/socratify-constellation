type SignInResult = { data: { user: null; session: null }; error: { message: string } | null };

function createSupabaseBrowserClient() {
  const signInWithOtp = async (): Promise<SignInResult> => ({
    data: { user: null, session: null },
    error: null,
  });

  return {
    auth: { signInWithOtp },
  };
}

export { createSupabaseBrowserClient };
