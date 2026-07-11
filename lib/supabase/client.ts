import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Returns the current session, signing the user in anonymously if needed.
 *
 * We only call this right before a write (insert/upload/delete), not on
 * page load — pure visitors who never create a card shouldn't get a user
 * row created for them. The anonymous session persists in localStorage,
 * so a returning visitor keeps the same user id (and ownership of their
 * cards) until they clear site data.
 */
export async function ensureSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.session) {
    throw new Error(`Sign-in failed: ${error?.message ?? "no session"}`);
  }
  return data.session;
}
