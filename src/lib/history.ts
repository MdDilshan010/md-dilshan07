import { supabase } from "@/integrations/supabase/client";

export type Entry = { id: string; title: string; code: string; language: string; difficulty: string; explanation: string; created_at: string; settings: unknown };

export async function fetchHistory(): Promise<Entry[]> {
  const { data, error } = await supabase.from("explanations").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  return data as Entry[];
}
