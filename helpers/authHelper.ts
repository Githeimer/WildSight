import { supabase } from "@/lib/supabase";

export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data;
}

export async function createUser({
  email,
  username,
}: {
  email: string;
  username: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, username }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
